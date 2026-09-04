#!/usr/bin/env python
"""Tests for generate_csr.py."""

from __future__ import annotations

import argparse
import io
import os
import stat
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec, rsa

from generate_csr import (
    DEFAULT_KEY_PRESET,
    KEY_PRESETS,
    build_output_paths,
    generate_csr,
    generate_ecc_private_key,
    generate_private_key,
    generate_rsa_private_key,
    main,
    parse_arguments,
    resolve_subject_fields,
    sanitize_filename_component,
    save_csr,
    save_private_key,
    validate_country_code,
)

SAMPLE_SUBJECT = {
    "country": "US",
    "state": "California",
    "locality": "San Francisco",
    "organization": "My Company Inc.",
    "organizational_unit": "IT Department",
    "common_name": "www.example.com",
    "email": "admin@example.com",
    "san_dns_names": ["www.example.com", "example.com", "sub.example.com"],
}


class TestGeneratePrivateKey(unittest.TestCase):
    """Tests for the key-generation helpers and KEY_PRESETS."""

    def test_rsa_key_has_requested_size(self):
        private_key = generate_rsa_private_key(2048)
        self.assertIsInstance(private_key, rsa.RSAPrivateKey)
        self.assertEqual(private_key.key_size, 2048)

    def test_ecc_key_has_requested_curve(self):
        private_key = generate_ecc_private_key(ec.SECP384R1())
        self.assertIsInstance(private_key, ec.EllipticCurvePrivateKey)
        self.assertEqual(private_key.curve.name, ec.SECP384R1().name)

    def test_default_preset_is_registered(self):
        self.assertIn(DEFAULT_KEY_PRESET, KEY_PRESETS)

    def test_generate_private_key_for_each_preset(self):
        expected_types = {
            "rsa-2048": rsa.RSAPrivateKey,
            "rsa-3072": rsa.RSAPrivateKey,
            "rsa-4096": rsa.RSAPrivateKey,
            "ecdsa-p256": ec.EllipticCurvePrivateKey,
            "ecdsa-p384": ec.EllipticCurvePrivateKey,
        }
        self.assertEqual(set(expected_types), set(KEY_PRESETS))

        for preset_name, expected_type in expected_types.items():
            with self.subTest(preset=preset_name):
                private_key = generate_private_key(preset_name)
                self.assertIsInstance(private_key, expected_type)

    def test_generate_private_key_rejects_unknown_preset(self):
        with self.assertRaises(KeyError):
            generate_private_key("not-a-real-preset")


class TestSaveKeyAndCsr(unittest.TestCase):
    """Tests for save_private_key() and save_csr()."""

    def test_save_private_key_round_trips_and_restricts_permissions(self):
        private_key = generate_ecc_private_key(ec.SECP384R1())

        with tempfile.TemporaryDirectory() as tmp_dir:
            path = Path(tmp_dir) / "test_private_key.pem"
            save_private_key(private_key, path)

            loaded_key = serialization.load_pem_private_key(
                path.read_bytes(), password=None
            )
            self.assertEqual(
                private_key.private_numbers(), loaded_key.private_numbers()
            )

            mode = stat.S_IMODE(path.stat().st_mode)
            self.assertEqual(mode, stat.S_IRUSR | stat.S_IWUSR)

    def test_save_private_key_accepts_string_path(self):
        private_key = generate_rsa_private_key(2048)

        with tempfile.TemporaryDirectory() as tmp_dir:
            filename = os.path.join(tmp_dir, "test_private_key.pem")
            save_private_key(private_key, filename)
            self.assertTrue(os.path.exists(filename))

    def test_csr_subject_and_sans(self):
        private_key = generate_ecc_private_key(ec.SECP384R1())
        csr = generate_csr(private_key, **SAMPLE_SUBJECT)

        with tempfile.TemporaryDirectory() as tmp_dir:
            csr_path = Path(tmp_dir) / "test_csr.pem"
            save_csr(csr, csr_path)
            loaded_csr = x509.load_pem_x509_csr(csr_path.read_bytes())

        subject = loaded_csr.subject
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.COUNTRY_NAME)[0].value,
            SAMPLE_SUBJECT["country"],
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.STATE_OR_PROVINCE_NAME)[
                0
            ].value,
            SAMPLE_SUBJECT["state"],
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.LOCALITY_NAME)[0].value,
            SAMPLE_SUBJECT["locality"],
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.ORGANIZATION_NAME)[0].value,
            SAMPLE_SUBJECT["organization"],
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.ORGANIZATIONAL_UNIT_NAME)[
                0
            ].value,
            SAMPLE_SUBJECT["organizational_unit"],
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.COMMON_NAME)[0].value,
            SAMPLE_SUBJECT["common_name"],
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.EMAIL_ADDRESS)[0].value,
            SAMPLE_SUBJECT["email"],
        )

        san_extension = loaded_csr.extensions.get_extension_for_class(
            x509.SubjectAlternativeName
        )
        san_list = san_extension.value.get_values_for_type(x509.DNSName)
        self.assertEqual(san_list, SAMPLE_SUBJECT["san_dns_names"])

    def test_csr_without_sans_omits_extension(self):
        private_key = generate_rsa_private_key(2048)
        subject = dict(SAMPLE_SUBJECT, san_dns_names=[])
        csr = generate_csr(private_key, **subject)

        with self.assertRaises(x509.ExtensionNotFound):
            csr.extensions.get_extension_for_class(x509.SubjectAlternativeName)


class TestValidateCountryCode(unittest.TestCase):
    """Tests for validate_country_code()."""

    def test_normalizes_case_and_whitespace(self):
        self.assertEqual(validate_country_code(" us "), "US")

    def test_rejects_wrong_length(self):
        with self.assertRaises(ValueError):
            validate_country_code("USA")

    def test_rejects_non_alphabetic(self):
        with self.assertRaises(ValueError):
            validate_country_code("U1")


class TestSanitizeFilenameComponent(unittest.TestCase):
    """Tests for sanitize_filename_component()."""

    def test_replaces_spaces_and_dots(self):
        self.assertEqual(
            sanitize_filename_component("www.example.com"), "www.example.com"
        )
        self.assertEqual(sanitize_filename_component("My Server"), "My_Server")

    def test_replaces_path_separators_and_wildcards(self):
        self.assertEqual(sanitize_filename_component("*.example.com"), "_.example.com")
        self.assertEqual(sanitize_filename_component("a/b\\c"), "a_b_c")


class TestBuildOutputPaths(unittest.TestCase):
    """Tests for build_output_paths()."""

    def test_builds_private_key_and_csr_paths_under_output_dir(self):
        output_dir = Path("/tmp/certs")
        private_key_path, csr_path = build_output_paths(output_dir, "www.example.com")

        self.assertEqual(private_key_path.parent, output_dir)
        self.assertEqual(csr_path.parent, output_dir)
        self.assertTrue(private_key_path.name.startswith("www.example.com_"))
        self.assertTrue(private_key_path.name.endswith("_private.pem"))
        self.assertTrue(csr_path.name.endswith("_csr.pem"))


class TestResolveSubjectFields(unittest.TestCase):
    """Tests for resolve_subject_fields()."""

    def _args(self, **overrides):
        defaults = {
            "country": None,
            "state": None,
            "locality": None,
            "organization": None,
            "organizational_unit": None,
            "common_name": None,
            "email": None,
            "san": None,
        }
        defaults.update(overrides)
        return argparse.Namespace(**defaults)

    def test_uses_provided_flags_without_prompting(self):
        args = self._args(
            country="US",
            state="New Jersey",
            locality="Newark",
            organization="MyOrg",
            organizational_unit="IT",
            common_name="www.example.com",
            email="admin@example.com",
            san=["www.example.com"],
        )
        with patch("builtins.input", side_effect=AssertionError("should not prompt")):
            subject = resolve_subject_fields(args)

        self.assertEqual(subject.country, "US")
        self.assertEqual(subject.common_name, "www.example.com")
        self.assertEqual(subject.san_dns_names, ["www.example.com"])

    def test_prompts_for_missing_fields(self):
        args = self._args(common_name="www.example.com")
        prompt_answers = iter(
            ["US", "New Jersey", "Newark", "MyOrg", "IT", "admin@example.com", ""]
        )
        with patch("builtins.input", side_effect=lambda _prompt: next(prompt_answers)):
            subject = resolve_subject_fields(args)

        self.assertEqual(subject.country, "US")
        self.assertEqual(subject.common_name, "www.example.com")
        self.assertEqual(subject.san_dns_names, [])

    def test_reprompts_on_invalid_country_code(self):
        args = self._args(common_name="www.example.com")
        prompt_answers = iter(
            [
                "USA",  # invalid, should reprompt
                "US",
                "New Jersey",
                "Newark",
                "MyOrg",
                "IT",
                "admin@example.com",
                "",
            ]
        )
        with patch("builtins.input", side_effect=lambda _prompt: next(prompt_answers)):
            subject = resolve_subject_fields(args)

        self.assertEqual(subject.country, "US")

    def test_san_flag_with_no_values_skips_prompt(self):
        args = self._args(
            country="US",
            state="New Jersey",
            locality="Newark",
            organization="MyOrg",
            organizational_unit="IT",
            common_name="www.example.com",
            email="admin@example.com",
            san=[],
        )
        with patch("builtins.input", side_effect=AssertionError("should not prompt")):
            subject = resolve_subject_fields(args)

        self.assertEqual(subject.san_dns_names, [])

    def test_san_prompt_accepts_comma_separated_values(self):
        args = self._args(
            country="US",
            state="New Jersey",
            locality="Newark",
            organization="MyOrg",
            organizational_unit="IT",
            common_name="www.example.com",
            email="admin@example.com",
        )
        with patch("builtins.input", return_value="a.example.com, b.example.com"):
            subject = resolve_subject_fields(args)

        self.assertEqual(subject.san_dns_names, ["a.example.com", "b.example.com"])


class TestParseArguments(unittest.TestCase):
    """Tests for parse_arguments()."""

    def test_defaults(self):
        with patch.object(sys, "argv", ["generate_csr.py"]):
            args = parse_arguments()

        self.assertEqual(args.key, DEFAULT_KEY_PRESET)
        self.assertEqual(args.output_dir, Path("."))
        self.assertFalse(args.force)
        self.assertIsNone(args.san)

    def test_rejects_unknown_key_preset(self):
        with patch.object(sys, "argv", ["generate_csr.py", "--key", "rot13"]):
            with patch("sys.stderr", io.StringIO()), self.assertRaises(SystemExit):
                parse_arguments()

    def test_rejects_invalid_country_code_early(self):
        with patch.object(sys, "argv", ["generate_csr.py", "--country", "USA"]):
            stderr_buffer = io.StringIO()
            with self.assertRaises(SystemExit), patch("sys.stderr", stderr_buffer):
                parse_arguments()
            self.assertIn("2 letters", stderr_buffer.getvalue())

    def test_organizational_unit_and_common_name_flags(self):
        with patch.object(
            sys,
            "argv",
            [
                "generate_csr.py",
                "--organizational-unit",
                "IT",
                "--common-name",
                "www.example.com",
            ],
        ):
            args = parse_arguments()

        self.assertEqual(args.organizational_unit, "IT")
        self.assertEqual(args.common_name, "www.example.com")


class TestMain(unittest.TestCase):
    """End-to-end tests for main()."""

    def _argv(self, output_dir: Path, **overrides) -> list[str]:
        values = {
            "--country": "US",
            "--state": "New Jersey",
            "--locality": "Newark",
            "--organization": "MyOrg",
            "--organizational-unit": "IT",
            "--common-name": "www.example.com",
            "--email": "admin@example.com",
        }
        values.update(overrides)
        argv = ["generate_csr.py"]
        for flag, value in values.items():
            argv.extend([flag, value])
        argv.extend(["--san", "--output-dir", str(output_dir)])
        return argv

    def test_writes_key_and_csr_to_output_dir(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            output_dir = Path(tmp_dir) / "certs"
            with patch.object(sys, "argv", self._argv(output_dir)):
                stdout_buffer = io.StringIO()
                with redirect_stdout(stdout_buffer):
                    main()

            pem_files = list(output_dir.glob("*.pem"))
            self.assertEqual(len(pem_files), 2)
            self.assertIn("www.example.com_", stdout_buffer.getvalue())

    def test_refuses_to_overwrite_without_force(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            output_dir = Path(tmp_dir)
            argv = self._argv(output_dir)

            with patch.object(sys, "argv", argv):
                main()

            with patch.object(sys, "argv", argv):
                stderr_buffer = io.StringIO()
                with self.assertRaises(SystemExit) as exit_info:
                    with patch("sys.stderr", stderr_buffer):
                        main()

            self.assertEqual(exit_info.exception.code, 1)
            self.assertIn("refusing to overwrite", stderr_buffer.getvalue())

    def test_force_overwrites_existing_files(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            output_dir = Path(tmp_dir)
            argv = self._argv(output_dir)

            with patch.object(sys, "argv", argv):
                main()

            with patch.object(sys, "argv", [*argv, "--force"]):
                main()  # should not raise

    def test_invalid_key_generation_error_is_reported_cleanly(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            output_dir = Path(tmp_dir)
            argv = self._argv(output_dir)

            with patch(
                "generate_csr.generate_private_key", side_effect=KeyError("boom")
            ):
                with patch.object(sys, "argv", argv):
                    stderr_buffer = io.StringIO()
                    with self.assertRaises(SystemExit) as exit_info:
                        with patch("sys.stderr", stderr_buffer):
                            main()

            self.assertEqual(exit_info.exception.code, 1)
            self.assertIn("Error:", stderr_buffer.getvalue())


if __name__ == "__main__":
    unittest.main()
