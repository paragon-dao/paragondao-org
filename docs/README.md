# ParagonDAO.org - Auth Explorer Documentation

This folder contains the core documentation for the AmbientAuth Protocol that powers the Auth Explorer interface.

## 📚 Documentation Files

### Core Protocol
- **`AMBIENT_AUTH_PROTOCOL_README.md`** - Main protocol overview and implementation guide
- **`PROXIMITY_AUTHENTICATION_WHITEPAPER.md`** - Complete technical whitepaper

### Technical Details
- **`AUTHENTICATION_DECISION_LOGIC.md`** - How the auth server decides between Tier 1 and Tier 2 authentication
- **`MULTI_TIER_AUTHENTICATION.md`** - Detailed explanation of the two-tier system
- **`MINIMUM_REQUIREMENTS.md`** - System requirements and user requirements
- **`SECURITY_CONSIDERATIONS.md`** - Security threats, mitigations, and best practices

## 🎯 Key Concepts for UI Development

### Authentication Flow
1. **Tier 1 (95% of cases)**: Ambient sound only - both devices + auth server detect same environment
2. **Tier 2 (5% of cases)**: GGWave + ambient sound - when extra challenge needed

### User Experience
- Users get authentication hashes from services they authenticate with
- Users can search these hashes on the Auth Explorer
- Users can manage their devices and revoke access
- Users can verify that services are running trusted authentication nodes

### Core Trust Principle
Developers use zero-knowledge auth protocol by running approved, open-source auth instances. Users can verify developers are using trusted auth services through independent verification sites like ParagonDAO.org.

## 🚀 Implementation Notes

The Auth Explorer interface should:
- Allow hash-based search (like blockchain explorer)
- Show authentication history and device management
- Provide emergency recovery options
- Link to cosmic landing page for full experience
- Use clean, Google/Apple Music-style design

---

*This documentation supports the development of the ParagonDAO.org Auth Explorer - the most important website in the Personal AI era.*

