# Firestore Security Rules Documentation

## Overview

This document describes the Firestore security rules implemented for the MCLRA phone authentication system. The rules enforce proper access control based on user authentication and authorization levels.

## Security Model

### Authentication

- All database operations require user authentication via Firebase Auth
- Unauthenticated users are denied all access to Firestore collections

### Authorization Levels

1. **Head of Family**: Can create, read, update, and delete residents in their own house
2. **House Member**: Can read all data but cannot modify any resident information
3. **Cross-House Access**: All authenticated users can read data from all houses

## Collection Rules

### Users Collection (`/users/{userId}`)

**Read Access:**

- Users can only read their own user document
- Required for checking user role and house association

**Write Access:**

- Users can create their own document during registration
- Users can update their `lastLoginAt` timestamp
- All other modifications are denied

**Validation:**

- User ID must match the authenticated user's UID
- Required fields: `phoneNumber`, `role`, `houseId`, `createdAt`, `lastLoginAt`
- Role must be either 'head' or 'member'

### Houses Collection (`/houses/{houseId}`)

**Read Access:**

- All authenticated users can read all house documents
- Supports requirement for viewing all community houses

**Write Access:**

- Only authenticated users can create houses during registration
- Only head of family can update their own house (e.g., adding members)
- House number and head of family cannot be changed after creation

**Validation:**

- Required fields: `houseNumber`, `headOfFamilyId`, `memberIds`, `createdAt`, `updatedAt`
- Head of family ID must match the authenticated user
- Member IDs must be a list/array

### Residents Collection (`/residents/{residentId}`)

**Read Access:**

- All authenticated users can read all resident documents
- Supports community-wide visibility requirement

**Write Access:**

- **Create**: Only heads of family can create residents for their own house
- **Update**: Only heads of family can update residents in their own house
- **Delete**: Only heads of family can delete residents from their own house

**Validation:**

- Resident must belong to the user's house (`houseId` matches user's house)
- `createdBy` and `updatedBy` fields must be properly set
- All required resident fields must be present and properly typed

## Security Features

### Access Control Enforcement

- **Requirement 4.3**: Heads of family can only edit residents in their own house
- **Requirement 4.5**: Data access is restricted to appropriate house data
- **Requirement 5.2**: All authenticated users can read all house data
- **Requirement 5.4**: Members have read-only access to all houses
- **Requirement 5.5**: Unauthorized access is properly denied

### Data Validation

- Type checking for all required fields
- Timestamp validation using `request.time`
- User ID validation against authenticated user
- House association validation

### Helper Functions

- `isAuthenticated()`: Checks if user is logged in
- `getUserData()`: Retrieves user document for role checking
- `isHeadOfFamily()`: Validates user has 'head' role
- `isHeadOfHouse(houseId)`: Checks if user is head of specific house
- `isHeadOfResidentHouse(residentData)`: Validates user can edit specific resident

## Testing

### Automated Testing

Run the security rules test suite:

```bash
# Install Firebase testing tools
npm install -g @firebase/rules-unit-testing

# Run the test script
node firestore.test.js
```

### Manual Testing with Firebase Emulator

```bash
# Start the Firestore emulator
firebase emulators:start --only firestore

# Test with your application against the emulator
# Set FIRESTORE_EMULATOR_HOST=localhost:8080 in your environment
```

### Test Scenarios Covered

1. **Unauthenticated Access**: All operations should fail
2. **User Self-Access**: Users can read/update their own documents
3. **House Data Access**: All authenticated users can read all houses
4. **Resident Data Access**: All authenticated users can read all residents
5. **Resident Creation**: Only heads of family can create residents in their house
6. **Cross-House Protection**: Heads cannot create residents in other houses
7. **Resident Updates**: Only heads of family can update residents in their house
8. **Resident Deletion**: Only heads of family can delete residents from their house

## Deployment

### Deploy Rules to Firebase

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Verify Deployment

```bash
# Check current rules in Firebase Console
# Navigate to Firestore > Rules tab
# Verify the rules match the local firestore.rules file
```

## Security Considerations

### Data Privacy

- Users cannot access other users' personal information
- Phone numbers are protected within user documents
- Cross-house data access is read-only for members

### Authorization Bypass Prevention

- Multiple validation layers prevent privilege escalation
- User role checking uses server-side data, not client claims
- House association is validated on every operation

### Performance Optimization

- Rules use efficient document lookups
- Indexes are configured for common query patterns
- Helper functions minimize redundant checks

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check user authentication and role
2. **Invalid Data**: Verify all required fields are present and correctly typed
3. **Cross-House Access**: Ensure user is head of the correct house
4. **Timestamp Errors**: Use `request.time` for server timestamps

### Debug Mode

Enable Firestore debug logging in your application:

```javascript
import { connectFirestoreEmulator, enableNetwork } from "firebase/firestore";

// Enable debug logging
if (process.env.NODE_ENV === "development") {
  // Connect to emulator for testing
  connectFirestoreEmulator(db, "localhost", 8080);
}
```

## Maintenance

### Regular Reviews

- Review rules when adding new features
- Update test cases for new functionality
- Monitor Firebase Console for rule violations
- Update documentation when rules change

### Performance Monitoring

- Monitor rule evaluation performance in Firebase Console
- Optimize complex rules if needed
- Review index usage and performance
