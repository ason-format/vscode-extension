# Release Guide

This document explains how to create and publish a new release of the ASON VS Code Extension.

## Prerequisites

1. **VS Code Marketplace Account**: Create account at [marketplace.visualstudio.com](https://marketplace.visualstudio.com/)
2. **Personal Access Token**: Generate token for publishing
   - Go to [Azure DevOps](https://dev.azure.com/)
   - Create PAT with Marketplace (Manage) scope
3. **vsce CLI**: Install the VS Code extension publishing tool
   ```bash
   npm install -g @vscode/vsce
   ```

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backwards compatible

## Release Process

### Using the Release Script (Recommended)

```bash
# Run the automated release script
./scripts/release.sh

# Follow the interactive prompts:
# 1. Choose version bump type (patch/minor/major)
# 2. Review the new version
# 3. Script will update files, create tag, and push
```

### Manual Release Process

### 1. Update Version

Edit `package.json`:

```json
{
  "version": "1.0.0"  // Update this
}
```

### 2. Update CHANGELOG.md

Add a new section at the top:

```markdown
## [1.0.0] - 2025-01-15

### Added
- New feature X
- New feature Y

### Fixed
- Bug fix Z

### Changed
- Improvement W
```

### 3. Build Extension

```bash
# Compile TypeScript
npm run compile

# Package extension
vsce package
```

This creates a `.vsix` file like `ason-1.0.0.vsix`.

### 4. Commit Changes

```bash
git add package.json CHANGELOG.md
git commit -m "Release v1.0.0"
git push origin main
```

### 5. Create Git Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0

- New feature X
- New feature Y
- Bug fix Z"

# Push tag to GitHub
git push origin v1.0.0
```

### 6. Create GitHub Release

**Option A: Using GitHub UI**

1. Go to: https://github.com/ason-format/vscode-extension/releases/new
2. Choose tag: `v1.0.0`
3. Release title: `v1.0.0`
4. Description: Copy from CHANGELOG.md
5. Upload the `.vsix` file
6. Click "Publish release"

**Option B: Using GitHub CLI**

```bash
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes-file - \
  ason-1.0.0.vsix <<EOF
## What's New

- New feature X
- New feature Y
- Bug fix Z

## Installation

Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ason-format.ason) or download the .vsix file from this release.

## Full Changelog

See [CHANGELOG.md](https://github.com/ason-format/vscode-extension/blob/main/CHANGELOG.md)
EOF
```

### 7. Publish to VS Code Marketplace

```bash
# Login to marketplace (first time only)
vsce login ason-format

# Publish extension
vsce publish
```

Or publish the .vsix file directly:

```bash
vsce publish --packagePath ason-1.0.0.vsix
```

### 8. Verify Publication

1. Check marketplace: https://marketplace.visualstudio.com/items?itemName=ason-format.ason
2. Install in VS Code and test
3. Check GitHub release: https://github.com/ason-format/vscode-extension/releases

## Quick Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with changes
- [ ] Build and test: `npm run compile`
- [ ] Package extension: `vsce package`
- [ ] Commit and push changes
- [ ] Create and push git tag `v1.x.x`
- [ ] Create GitHub release with .vsix file
- [ ] Publish to VS Code Marketplace: `vsce publish`
- [ ] Verify extension appears in marketplace
- [ ] Test installation from marketplace

## Troubleshooting

### Build Fails

1. Check TypeScript compilation: `npm run compile`
2. Fix any type errors
3. Ensure all dependencies are installed

### vsce Package Fails

1. Check `package.json` is valid
2. Ensure all required fields are present
3. Check `.vscodeignore` doesn't exclude necessary files

### Marketplace Publishing Fails

1. Verify PAT is valid
2. Check marketplace account permissions
3. Ensure extension name is unique
4. Verify publisher name matches

### Version Conflicts

If version already exists on marketplace:

```bash
# Increment patch version
# package.json: "1.0.0" → "1.0.1"

# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push --delete origin v1.0.0

# Re-package and publish
vsce package
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
vsce publish
```

## Post-Release

1. Announce on GitHub Discussions
2. Update documentation if needed
3. Close related issues/PRs
4. Monitor marketplace ratings and reviews

## Beta/Pre-releases

For beta versions:

```bash
# Update version to pre-release
# package.json: "1.1.0-beta.1"

# Package and tag
vsce package
git tag -a v1.0.0-beta.1 -m "Beta release"
git push origin v1.0.0-beta.1

# Publish as pre-release (requires vsce 2.x+)
vsce publish --pre-release
```

## References

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Publishing VS Code Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
