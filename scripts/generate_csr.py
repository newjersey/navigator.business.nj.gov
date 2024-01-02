#!/usr/bin/env python

from cryptography import x509
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from cryptography.x509.oid import NameOID
from datetime import datetime

import argparse


def generate_ecc_private_key(curve: ec.EllipticCurve) -> ec.EllipticCurvePrivateKey:
    """
    Generate an ECC private key using the provided curve.

    :param curve: An instance of EllipticCurve to use for key generation.
    :return: ECC private key.
    """
    private_key = ec.generate_private_key(curve)
    return private_key


def generate_csr(
    private_key: ec.EllipticCurvePrivateKey,
    country: str,
    state: str,
    locality: str,
    organization: str,
    organizational_unit: str,
    common_name: str,
    email: str,
    san_dns_names: list,
) -> x509.CertificateSigningRequest:
    """
    Generate a CSR using the provided private key and subject information.
    :param private_key: ECC private key.
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

    csr = csr_builder.sign(private_key, hashes.SHA384())
    return csr


def save_private_key(private_key: ec.EllipticCurvePrivateKey, filename: str) -> None:
    """
    Save an ECC private key to a file.

    :param private_key: ECC private key to save.
    :param filename: Name of the file to save the key in.
    """
    with open(filename, "wb") as key_file:
        key_file.write(
            private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption(),
            )
        )


def save_csr(csr: x509.CertificateSigningRequest, filename: str) -> None:
    """
    Save a CSR to a file.

    :param csr: CSR to save.
    :param filename: Name of the file to save the CSR in.
    """
    with open(filename, "wb") as csr_file:
        csr_file.write(csr.public_bytes(serialization.Encoding.PEM))


def main():
    parser = argparse.ArgumentParser(
        description="Generate ECC-based private key and CSR.",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument("--country", required=True, help="Country Name (2 letter code)")
    parser.add_argument(
        "--state", required=True, help="State or Province Name (full name)"
    )
    parser.add_argument("--locality", required=True, help="Locality Name (eg, city)")
    parser.add_argument(
        "--organization", required=True, help="Organization Name (eg, company)"
    )
    parser.add_argument(
        "--organizational_unit",
        required=True,
        help="Organizational Unit Name (eg, section)",
    )
    parser.add_argument(
        "--common_name",
        required=True,
        help="Common Name (e.g. server FQDN or YOUR name)",
    )
    parser.add_argument("--email", required=True, help="Email Address")
    parser.add_argument(
        "--san",
        nargs="*",
        help="Subject Alternative Names (SANs) - space-separated list",
        default=[],
    )

    parser.epilog = (
        "Example usage:\n"
        "./generate_csr.py --country US --state NJ --locality Newark --organization MyOrg \\\n"
        "                      --organizational_unit IT --common_name www.example.com --email admin@example.com \\\n"
        "                      --san www.example.com example.com sub.example.com"
    )

    args = parser.parse_args()

    print(args)

    # Generate the ECC private key
    private_key = generate_ecc_private_key(ec.SECP384R1())

    # Generate the CSR
    csr = generate_csr(
        private_key,
        args.country,
        args.state,
        args.locality,
        args.organization,
        args.organizational_unit,
        args.common_name,
        args.email,
        args.san,
    )

    # Format the current date as year and month
    current_date = datetime.now().strftime("%Y%m")

    # Replace spaces and periods with underscores in the common name
    formatted_common_name = args.common_name.replace(" ", "_").replace(".", "_")

    # Construct the filenames using the given naming convention
    private_key_filename = f"{formatted_common_name}_{current_date}_private.pem"
    csr_filename = f"{formatted_common_name}_{current_date}_csr.pem"

    # Save the private key and CSR to files
    save_private_key(private_key, private_key_filename)
    save_csr(csr, csr_filename)


if __name__ == "__main__":
    main()
