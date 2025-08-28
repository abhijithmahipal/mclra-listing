# Authorization Components

This directory contains components and utilities for handling authentication and authorization in the MCLRA resident management application.

## Components

### ProtectedRoute

A component that protects entire routes based on authentication and authorization requirements.

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

// Protect a route that requires authentication
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

// Protect a route that requires head of family role
<ProtectedRoute requireRole="head">
  <AddHomePage />
</ProtectedRoute>

// Protect a route that requires access to a specific house
<ProtectedRoute requireHouseAccess="house123">
  <EditHousePage />
</ProtectedRoute>
```

### PermissionGate

A component for conditional rendering based on user permissions.

```tsx
import PermissionGate from "@/components/PermissionGate";

// Show content only to heads of family
<PermissionGate requireRole="head">
  <button>Add Resident</button>
</PermissionGate>

// Show content with fallback
<PermissionGate
  requireRole="head"
  fallback={<p>Only heads of family can edit residents</p>}
>
  <EditForm />
</PermissionGate>

// Show unauthorized message
<PermissionGate
  requireAddHomeAccess={true}
  showUnauthorizedMessage={true}
>
  <AddHomeButton />
</PermissionGate>
```

### withAuth HOC

Higher-order component for protecting components with authentication.

```tsx
import { withAuth, withHeadOfFamilyAuth } from "@/components/withAuth";

// Basic authentication requirement
const ProtectedComponent = withAuth(YourComponent);

// Require head of family role
const HeadOnlyComponent = withHeadOfFamilyAuth(YourComponent);

// Custom requirements
const CustomProtectedComponent = withAuth(YourComponent, {
  requireRole: "head",
  requireHouseAccess: "house123",
  customCheck: (user, isAuthenticated) => {
    return user?.role === "head" && user?.houseId === "house123";
  },
});
```

## Permission Utilities

### Permission Functions

```tsx
import {
  canEditHouse,
  canAccessAddHome,
  isHeadOfFamily,
  getPermissionErrorMessage,
} from "@/lib/permissions";

// Check if user can edit a house
if (canEditHouse(user, houseId)) {
  // Show edit controls
}

// Check if user can access add home
if (canAccessAddHome(user)) {
  // Show add home button
}

// Get appropriate error message
const errorMessage = getPermissionErrorMessage(user, "edit_house", houseId);
```

## Usage Examples

### Protecting Pages

```tsx
// pages/addhome/page.tsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AddHomePage() {
  return (
    <ProtectedRoute requireRole="head">
      <div>
        <h1>Add Home</h1>
        {/* Add home form */}
      </div>
    </ProtectedRoute>
  );
}
```

### Conditional UI Elements

```tsx
// components/HouseCard.tsx
import PermissionGate from "@/components/PermissionGate";

export default function HouseCard({ house }) {
  return (
    <div className="house-card">
      <h3>{house.houseNumber}</h3>

      <PermissionGate requireHouseAccess={house.id}>
        <button>Edit House</button>
      </PermissionGate>

      <PermissionGate
        requireHouseAccess={house.id}
        fallback={<span>View Only</span>}
      >
        <button>Manage Residents</button>
      </PermissionGate>
    </div>
  );
}
```

### Navigation with Permissions

```tsx
// components/Navigation.tsx
import { useAuth } from "@/contexts/AuthContext";
import PermissionGate from "@/components/PermissionGate";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav>
      {isAuthenticated && (
        <>
          <Link href="/houses">Houses</Link>

          <PermissionGate requireRole="head">
            <Link href="/addhome">Add Home</Link>
          </PermissionGate>
        </>
      )}
    </nav>
  );
}
```

## Error Handling

The components provide comprehensive error handling with user-friendly messages:

- **Authentication errors**: Redirect to login with appropriate messaging
- **Authorization errors**: Show access denied messages with role information
- **Loading states**: Display loading indicators during auth checks
- **Network errors**: Graceful handling of connection issues

## Testing

The components include comprehensive test coverage. Run tests with:

```bash
npm test src/components/__tests__/auth.test.tsx
```

## Requirements Covered

This implementation covers the following requirements:

- **4.3**: Authorization checks for house editing permissions
- **5.3**: Access control for add home functionality
- **5.5**: Unauthorized access handling with appropriate error messages
