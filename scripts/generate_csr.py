#!/usr/bin/env python3
"""Generate a private key and Certificate Signing Request (CSR).

Supports RSA and ECDSA keys via named `--key` presets. Any subject field not
passed as a flag is collected with an interactive prompt, so the script can
be run with zero arguments or fully scripted for automation. The private key
and CSR are written to timestamped files (owner-only permissions on the key)
and existing files are never overwritten unless `--force` is passed.

Usage:
    Fully interactive:
        $ ./generate_csr.py

    Fully scripted:
        $ ./generate_csr.py --country US --state "New Jersey" --locality Newark \\
              --organization MyOrg --organizational-unit IT \\
              --common-name www.example.com --email admin@example.com \\
              --san www.example.com example.com --key ecdsa-p384 \\
              --output-dir ./certs

    Mixed (prompts only for what's missing):
        $ ./generate_csr.py --common-name www.example.com --key rsa-4096
"""

from __future__ import annotations

import argparse
import re
import stat
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable, Final, NamedTuple, Union

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, rsa
from cryptography.x509.oid import NameOID

__all__ = [
    "KEY_PRESETS",
    "DEFAULT_KEY_PRESET",
    "PrivateKey",
    "SubjectFields",
    "generate_rsa_private_key",
    "generate_ecc_private_key",
    "generate_private_key",
    "generate_csr",
    "save_private_key",
    "save_csr",
    "validate_country_code",
    "sanitize_filename_component",
    "build_output_paths",
    "resolve_subject_fields",
    "main",
]

PrivateKey = Union[rsa.RSAPrivateKey, ec.EllipticCurvePrivateKey]

# Characters that are safe to leave unescaped in a generated filename.
_UNSAFE_FILENAME_CHARS: Final[re.Pattern[str]] = re.compile(r"[^A-Za-z0-9._-]")

# Owner-only permissions (0600) for the generated private key file.
_PRIVATE_KEY_FILE_MODE: Final[int] = stat.S_IRUSR | stat.S_IWUSR


def generate_rsa_private_key(key_size: int = 2048) -> rsa.RSAPrivateKey:
    """
    Generate an RSA private key using the provided key size.

    :param key_size: Size of the key to be generated (default is 2048).
    :return: RSA private key.
    """
    return rsa.generate_private_key(public_exponent=65537, key_size=key_size)


def generate_ecc_private_key(curve: ec.EllipticCurve) -> ec.EllipticCurvePrivateKey:
    """
    Generate an ECC private key using the provided curve.

    :param curve: An instance of EllipticCurve to use for key generation.
    :return: ECC private key.
    """
    return ec.generate_private_key(curve)


class KeyPreset(NamedTuple):
    """A named, human-readable private-key algorithm and size/curve choice."""

    description: str
    generate: Callable[[], PrivateKey]


# Named `--key` choices. Keep names stable: they're a public CLI contract.
KEY_PRESETS: Final[dict[str, KeyPreset]] = {
    "rsa-2048": KeyPreset("RSA 2048-bit", lambda: generate_rsa_private_key(2048)),
    "rsa-3072": KeyPreset("RSA 3072-bit", lambda: generate_rsa_private_key(3072)),
    "rsa-4096": KeyPreset("RSA 4096-bit", lambda: generate_rsa_private_key(4096)),
    "ecdsa-p256": KeyPreset(
        "ECDSA P-256 (secp256r1)", lambda: generate_ecc_private_key(ec.SECP256R1())
    ),
    "ecdsa-p384": KeyPreset(
        "ECDSA P-384 (secp384r1)", lambda: generate_ecc_private_key(ec.SECP384R1())
    ),
}
DEFAULT_KEY_PRESET: Final[str] = "rsa-2048"


def generate_private_key(preset: str) -> PrivateKey:
    """
    Generate a private key for the given KEY_PRESETS name.

    :param preset: One of the KEY_PRESETS keys (e.g. "rsa-2048", "ecdsa-p384").
    :return: A newly generated RSA or ECDSA private key.
    :raises KeyError: If preset is not a recognized preset name.
    """
    try:
        return KEY_PRESETS[preset].generate()
    except KeyError:
        valid = ", ".join(sorted(KEY_PRESETS))
        raise KeyError(
            f"Unknown key preset {preset!r}. Valid presets: {valid}."
        ) from None


def generate_csr(
    private_key: PrivateKey,
    country: str,
    state: str,
    locality: str,
    organization: str,
    organizational_unit: str,
    common_name: str,
    email: str,
    san_dns_names: list[str],
) -> x509.CertificateSigningRequest:
    """
    Generate a CSR using the provided private key and subject information.

    :param private_key: RSA or ECDSA private key.
    :param country: Country Name (2 letter code).
    :param state: State or Province Name (full name).
    :param locality: Locality Name (e.g., city).
    :param organization: Organization Name (e.g., company).
    :param organizational_unit: Organizational Unit Name (e.g., section).
    :param common_name: Common Name (e.g., server FQDN or YOUR name).
    :param email: Email Address.
    :param san_dns_names: A list of Subject Alternative Names (SANs).
    :return: Certificate Signing Request (CSR).
    """
    csr_builder = x509.CertificateSigningRequestBuilder()
    csr_builder = csr_builder.subject_name(
        x509.Name(
            [
                x509.NameAttribute(NameOID.COUNTRY_NAME, country),
                x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, state),
                x509.NameAttribute(NameOID.LOCALITY_NAME, locality),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, organization),
                x509.NameAttribute(
                    NameOID.ORGANIZATIONAL_UNIT_NAME, organizational_unit
                ),
                x509.NameAttribute(NameOID.COMMON_NAME, common_name),
                x509.NameAttribute(NameOID.EMAIL_ADDRESS, email),
            ]
        )
    )

    # Add SANs if provided
    if san_dns_names:
        san_list = [x509.DNSName(dns_name) for dns_name in san_dns_names]
        csr_builder = csr_builder.add_extension(
            x509.SubjectAlternativeName(san_list), critical=False
        )

    return csr_builder.sign(private_key, hashes.SHA384())


def save_private_key(private_key: PrivateKey, path: str | Path) -> None:
    """
    Save a private key to a file, restricting permissions to the owner.

    :param private_key: RSA or ECDSA private key to save.
    :param path: Destination file path.
    """
    destination = Path(path)
    destination.write_bytes(
        private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )
    destination.chmod(_PRIVATE_KEY_FILE_MODE)


def save_csr(csr: x509.CertificateSigningRequest, path: str | Path) -> None:
    """
    Save a CSR to a file.

    :param csr: CSR to save.
    :param path: Destination file path.
    """
    Path(path).write_bytes(csr.public_bytes(serialization.Encoding.PEM))


def validate_country_code(value: str) -> str:
    """
    Normalize and validate an ISO 3166-1 alpha-2 country code.

    :param value: A country code, in any case, optionally with whitespace.
    :return: The normalized (uppercased, trimmed) 2-letter country code.
    :raises ValueError: If value isn't exactly two alphabetic characters.
    """
    normalized = value.strip().upper()
    if len(normalized) != 2 or not normalized.isalpha():
        raise ValueError(
            f"Country code must be exactly 2 letters (e.g. US), got {value!r}."
        )
    return normalized


def _argparse_country_code(value: str) -> str:
    """Adapt validate_country_code for use as an argparse `type=`."""
    try:
        return validate_country_code(value)
    except ValueError as error:
        raise argparse.ArgumentTypeError(str(error)) from error


def sanitize_filename_component(value: str) -> str:
    """
    Replace characters that are unsafe in filenames with underscores.

    :param value: Arbitrary text (e.g. a Common Name) to embed in a filename.
    :return: value with anything other than letters, digits, `.`, `_`, `-`
        replaced by `_`.
    """
    return _UNSAFE_FILENAME_CHARS.sub("_", value)


def build_output_paths(output_dir: Path, common_name: str) -> tuple[Path, Path]:
    """
    Build the private key and CSR file paths for a given Common Name.

    Filenames encode the Common Name and the current year/month, matching
    the existing on-disk naming convention used for issued certificates.

    :param output_dir: Directory the files will be written into.
    :param common_name: The CSR's Common Name.
    :return: A (private_key_path, csr_path) tuple.
    """
    current_date = datetime.now().strftime("%Y%m")
    base_name = f"{sanitize_filename_component(common_name)}_{current_date}"
    return (
        output_dir / f"{base_name}_private.pem",
        output_dir / f"{base_name}_csr.pem",
    )


@dataclass(frozen=True)
class SubjectFields:
    """Resolved CSR subject fields, ready to pass to generate_csr()."""

    country: str
    state: str
    locality: str
    organization: str
    organizational_unit: str
    common_name: str
    email: str
    san_dns_names: list[str]


def _prompt_required(label: str, validate: Callable[[str], str] | None = None) -> str:
    """
    Prompt on stdin until the user enters a non-empty (and valid) value.

    :param label: Text shown before the prompt colon.
    :param validate: Optional function that raises ValueError on invalid
        input and otherwise returns the normalized value.
    :return: The user-provided value.
    """
    while True:
        value = input(f"{label}: ").strip()
        if not value:
            print("A value is required.", file=sys.stderr)
            continue
        if validate is None:
            return value
        try:
            return validate(value)
        except ValueError as error:
            print(str(error), file=sys.stderr)


def _prompt_optional_list(label: str) -> list[str]:
    """
    Prompt for a space- or comma-separated list; empty input returns [].

    :param label: Text shown before the prompt colon.
    :return: The parsed list of non-empty items.
    """
    raw = input(f"{label} (optional, space or comma separated, Enter to skip): ")
    return [item for item in re.split(r"[\s,]+", raw.strip()) if item]


def resolve_subject_fields(args: argparse.Namespace) -> SubjectFields:
    """
    Fill in any subject fields missing from argv via interactive prompts.

    :param args: Parsed CLI arguments from parse_arguments().
    :return: Fully-populated SubjectFields.
    """
    return SubjectFields(
        country=args.country
        or _prompt_required(
            "Country Name (2 letter code, e.g. US)", validate_country_code
        ),
        state=args.state
        or _prompt_required("State or Province Name (full name, e.g. New Jersey)"),
        locality=args.locality or _prompt_required("Locality Name (e.g. city)"),
        organization=args.organization
        or _prompt_required("Organization Name (e.g. company)"),
        organizational_unit=args.organizational_unit
        or _prompt_required("Organizational Unit Name (e.g. department or team)"),
        common_name=args.common_name
        or _prompt_required("Common Name (e.g. server FQDN or YOUR name)"),
        email=args.email or _prompt_required("Email Address"),
        san_dns_names=(
            args.san
            if args.san is not None
            else _prompt_optional_list("Subject Alternative Names (SANs)")
        ),
    )


def _build_epilog() -> str:
    """Build the --help epilog, listing key presets and an example."""
    preset_lines = "\n".join(
        f"  {name:<12} {preset.description}"
        for name, preset in sorted(KEY_PRESETS.items())
    )
    return (
        "Key presets:\n"
        f"{preset_lines}\n\n"
        "Any subject field not passed as a flag is prompted for interactively.\n\n"
        "Example usage:\n"
        '  ./generate_csr.py --country US --state "New Jersey" --locality Newark \\\n'
        "                     --organization MyOrg --organizational-unit IT \\\n"
        "                     --common-name www.example.com --email admin@example.com \\\n"
        "                     --san www.example.com example.com --key ecdsa-p384"
    )


def parse_arguments() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate a private key (RSA or ECDSA) and a matching CSR.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=_build_epilog(),
    )
    parser.add_argument(
        "--country", type=_argparse_country_code, help="Country Name (2 letter code)"
    )
    parser.add_argument("--state", help="State or Province Name (full name)")
    parser.add_argument("--locality", help="Locality Name (eg, city)")
    parser.add_argument("--organization", help="Organization Name (eg, company)")
    parser.add_argument(
        "--organizational-unit", help="Organizational Unit Name (eg, section)"
    )
    parser.add_argument(
        "--common-name", help="Common Name (e.g. server FQDN or YOUR name)"
    )
    parser.add_argument("--email", help="Email Address")
    parser.add_argument(
        "--san",
        nargs="*",
        metavar="DNS_NAME",
        help=(
            "Subject Alternative Names (SANs), space-separated. Omit this "
            "flag entirely to be prompted; pass it with no names to skip SANs."
        ),
    )
    parser.add_argument(
        "--key",
        choices=sorted(KEY_PRESETS),
        default=DEFAULT_KEY_PRESET,
        help=f"Private key algorithm and size/curve (default: {DEFAULT_KEY_PRESET})",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("."),
        help="Directory to write the private key and CSR into (default: current directory)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite the private key and CSR files if they already exist",
    )

    return parser.parse_args()


def main() -> None:
    args = parse_arguments()

    try:
        subject = resolve_subject_fields(args)
        private_key = generate_private_key(args.key)
        csr = generate_csr(
            private_key,
            subject.country,
            subject.state,
            subject.locality,
            subject.organization,
            subject.organizational_unit,
            subject.common_name,
            subject.email,
            subject.san_dns_names,
        )
    except (EOFError, KeyboardInterrupt):
        print("\nAborted.", file=sys.stderr)
        sys.exit(1)
    except (ValueError, KeyError) as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)

    private_key_path, csr_path = build_output_paths(
        args.output_dir, subject.common_name
    )

    if not args.force:
        existing = [path for path in (private_key_path, csr_path) if path.exists()]
        if existing:
            names = ", ".join(str(path) for path in existing)
            print(
                f"Error: refusing to overwrite existing file(s): {names}\n"
                "Re-run with --force to overwrite them.",
                file=sys.stderr,
            )
            sys.exit(1)

    private_key_path.parent.mkdir(parents=True, exist_ok=True)
    save_private_key(private_key, private_key_path)
    save_csr(csr, csr_path)

    print(
        f"Generated {KEY_PRESETS[args.key].description} key and CSR "
        f"for {subject.common_name!r}:"
    )
    print(f"  Private key: {private_key_path}")
    print(f"  CSR:         {csr_path}")


if __name__ == "__main__":
    main()
