# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The ASON VS Code Extension team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Preferred**: Open a [Security Advisory](https://github.com/ason-format/vscode-extension/security/advisories/new) on GitHub
2. **Alternative**: Email us at security@your-domain.com with details

### What to Include in Your Report

To help us better understand the nature and scope of the possible issue, please include as much of the following information as possible:

* **Type of issue** (e.g., buffer overflow, injection, etc.)
* **Full paths** of source file(s) related to the manifestation of the issue
* **Location** of the affected source code (tag/branch/commit or direct URL)
* **Step-by-step instructions** to reproduce the issue
* **Proof-of-concept or exploit code** (if possible)
* **Impact** of the issue, including how an attacker might exploit it

### What to Expect

* **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
* **Assessment**: We will assess the report and determine the severity and impact
* **Updates**: We will send you regular updates about our progress
* **Fix Timeline**: We aim to release a fix within 90 days of acknowledgment
* **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Considerations for ASON VS Code Extension

### Input Validation

The extension processes JSON data from editor selections. When using this extension:

* **Validate input** before compression
* **Be aware** that compressed output is still text-based and not encrypted
* **Don't compress sensitive data** without additional encryption

### Extension Permissions

The VS Code extension requires:

* Access to text editor content
* Ability to modify editor selections
* Clipboard access (for copy operations)

These are standard permissions for text manipulation extensions.

### Common Security Best Practices

When using the ASON VS Code Extension:

1. **Data Privacy**
   - The extension processes data locally
   - No data is sent to external servers
   - All compression happens in your VS Code instance

2. **Sensitive Data**
   - Be cautious when compressing files with sensitive information
   - ASON compression does not provide encryption
   - Compressed data retains original structure

## Known Security Considerations

### 1. Denial of Service (DoS)

**Risk**: Very large or deeply nested JSON structures could cause performance issues in VS Code.

**Mitigation**:
* Extension limits input size
* Large file operations may be slower
* Monitor VS Code performance

### 2. Information Disclosure

**Risk**: Compressed data retains the structure and content of original JSON.

**Mitigation**:
* Don't rely on ASON for data obfuscation
* Use encryption for sensitive data
* Be aware of clipboard history tools

## Security Updates

Security updates will be announced:

* In the GitHub Security Advisories section
* In release notes for patched versions
* Via GitHub notifications if you watch the repository
* Via VS Code extension update notifications

## Scope

This security policy applies to:

* The VS Code extension implementation
* All published extension versions

This policy does **not** cover:

* Third-party dependencies (report to respective projects)
* User applications built with the extension
* VS Code itself (report to Microsoft)

## Bug Bounty Program

We currently do not have a bug bounty program. However, we deeply appreciate security research and will:

* Publicly acknowledge contributors (with permission)
* Provide credit in security advisories
* Consider featuring significant contributions in project updates

## Questions

If you have questions about this security policy, please:

* Open a general issue (for non-sensitive questions)
* Contact the maintainers via GitHub discussions
* Email security@your-domain.com for sensitive inquiries

Thank you for helping keep ASON VS Code Extension and our users safe!
