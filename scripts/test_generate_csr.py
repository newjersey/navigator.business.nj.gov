#!/usr/bin/env python

import unittest
from cryptography import x509
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from generate_csr import (
    generate_ecc_private_key,
    save_private_key,
    generate_csr,
    save_csr,
)
import os


class TestECCKeyAndCSRGeneration(unittest.TestCase):
    def test_save_private_key(self):
        """Test that the correct kind of private key is generated."""

        # Generate a temporary ECC private key
        private_key = generate_ecc_private_key(ec.SECP384R1())

        # Save it to a file
        filename = "test_private_key.pem"
        save_private_key(private_key, filename)

        # Read the content back
        with open(filename, "rb") as key_file:
            key_data = key_file.read()

        # Load the key from the content
        loaded_key = serialization.load_pem_private_key(key_data, password=None)

        # Check if the loaded key is the same as the original key
        self.assertEqual(private_key.private_numbers(), loaded_key.private_numbers())
        self.assertEqual(loaded_key.key_size, ec.SECP384R1().key_size)

        # Clean up the file
        os.remove(filename)

    def test_csr_subject_and_sans(self):
        """Test that the CSR contains the correct subject fields."""

        # Generate a private key
        curve = ec.SECP384R1()
        private_key = generate_ecc_private_key(curve)

        # Subject information
        country = "US"
        state = "California"
        locality = "San Francisco"
        organization = "My Company Inc."
        organizational_unit = "IT Department"
        common_name = "www.example.com"
        email = "admin@example.com"
        san_dns_names = ["www.example.com", "example.com", "sub.example.com"]

        # Generate CSR
        csr = generate_csr(
            private_key,
            country,
            state,
            locality,
            organization,
            organizational_unit,
            common_name,
            email,
            san_dns_names,
        )

        # Save CSR to a temporary file
        csr_filename = "test_csr.pem"
        save_csr(csr, csr_filename)

        # Read the CSR back from the file
        with open(csr_filename, "rb") as f:
            csr_data = f.read()
            loaded_csr = x509.load_pem_x509_csr(csr_data)

        # Extract subject from CSR
        subject = loaded_csr.subject

        # Verify that the subject fields match what was provided
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.COUNTRY_NAME)[0].value, country
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.STATE_OR_PROVINCE_NAME)[
                0
            ].value,
            state,
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.LOCALITY_NAME)[0].value,
            locality,
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.ORGANIZATION_NAME)[0].value,
            organization,
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.ORGANIZATIONAL_UNIT_NAME)[
                0
            ].value,
            organizational_unit,
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.COMMON_NAME)[0].value,
            common_name,
        )
        self.assertEqual(
            subject.get_attributes_for_oid(x509.NameOID.EMAIL_ADDRESS)[0].value, email
        )

        # Extract SANs from CSR
        san_extension = loaded_csr.extensions.get_extension_for_class(
            x509.SubjectAlternativeName
        )
        san_list = san_extension.value.get_values_for_type(x509.DNSName)

        # Verify that the SANs match what was provided
        self.assertEqual(san_list, san_dns_names)

        # Clean up the temporary CSR file
        os.remove(csr_filename)


# Run the unit tests
if __name__ == "__main__":
    unittest.main()
