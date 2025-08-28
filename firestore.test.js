/**
 * Firestore Security Rules Test Script
 *
 * This script provides test cases to validate the Firestore security rules.
 * Run with: npm install -g @firebase/rules-unit-testing
 * Then: node firestore.test.js
 *
 * Or use Firebase Emulator Suite for comprehensive testing:
 * firebase emulators:start --only firestore
 */

const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");

// Test data
const testData = {
  users: {
    headUser1: {
      id: "head-user-1",
      phoneNumber: "+919400722590",
      role: "head",
      houseId: "house-1",
      createdAt: { seconds: 1640995200, nanoseconds: 0 },
      lastLoginAt: { seconds: 1640995200, nanoseconds: 0 },
    },
    memberUser1: {
      id: "member-user-1",
      phoneNumber: "+919876543210",
      role: "member",
      houseId: "house-1",
      createdAt: { seconds: 1640995200, nanoseconds: 0 },
      lastLoginAt: { seconds: 1640995200, nanoseconds: 0 },
    },
    headUser2: {
      id: "head-user-2",
      phoneNumber: "+919123456789",
      role: "head",
      houseId: "house-2",
      createdAt: { seconds: 1640995200, nanoseconds: 0 },
      lastLoginAt: { seconds: 1640995200, nanoseconds: 0 },
    },
  },
  houses: {
    house1: {
      id: "house-1",
      houseNumber: "96A",
      headOfFamilyId: "head-user-1",
      memberIds: ["head-user-1", "member-user-1"],
      createdAt: { seconds: 1640995200, nanoseconds: 0 },
      updatedAt: { seconds: 1640995200, nanoseconds: 0 },
    },
    house2: {
      id: "house-2",
      houseNumber: "97",
      headOfFamilyId: "head-user-2",
      memberIds: ["head-user-2"],
      createdAt: { seconds: 1640995200, nanoseconds: 0 },
      updatedAt: { seconds: 1640995200, nanoseconds: 0 },
    },
  },
  residents: {
    resident1: {
      id: "resident-1",
      houseName: "Test House 1",
      houseNumber: "96A",
      street: "Test Street",
      ownership: "owned",
      floorType: "concrete",
      totalFamilyMembers: "4",
      headOfFamily: {
        name: "John Doe",
        phone: "+919400722590",
        occupation: "Engineer",
        bloodGroup: "O+",
        emergencyContact: { name: "Jane Doe", phone: "+919876543210" },
      },
      familyMembers: [],
      permanentAddress: "Test Address",
      ownerAddress: "Test Address",
      houseId: "house-1",
      createdBy: "head-user-1",
      updatedBy: "head-user-1",
      timestamp: { seconds: 1640995200, nanoseconds: 0 },
    },
  },
};

async function runTests() {
  console.log("🧪 Starting Firestore Security Rules Tests...\n");

  // Initialize test environment
  const testEnv = await initializeTestEnvironment({
    projectId: "test-project",
    firestore: {
      rules: require("fs").readFileSync("firestore.rules", "utf8"),
    },
  });

  try {
    // Test 1: Unauthenticated access should be denied
    console.log("Test 1: Unauthenticated access");
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.collection("users").doc("head-user-1").get());
    await assertFails(unauthedDb.collection("houses").doc("house-1").get());
    await assertFails(
      unauthedDb.collection("residents").doc("resident-1").get()
    );
    console.log("✅ Unauthenticated access properly denied\n");

    // Test 2: User can read their own user document
    console.log("Test 2: User self-access");
    const headUserDb = testEnv.authenticatedContext("head-user-1").firestore();
    await headUserDb
      .collection("users")
      .doc("head-user-1")
      .set(testData.users.headUser1);
    await assertSucceeds(
      headUserDb.collection("users").doc("head-user-1").get()
    );
    await assertFails(headUserDb.collection("users").doc("head-user-2").get());
    console.log("✅ User can read own document, cannot read others\n");

    // Test 3: All authenticated users can read house data
    console.log("Test 3: House data access");
    await headUserDb
      .collection("houses")
      .doc("house-1")
      .set(testData.houses.house1);
    await headUserDb
      .collection("houses")
      .doc("house-2")
      .set(testData.houses.house2);

    const memberUserDb = testEnv
      .authenticatedContext("member-user-1")
      .firestore();
    await memberUserDb
      .collection("users")
      .doc("member-user-1")
      .set(testData.users.memberUser1);

    await assertSucceeds(
      memberUserDb.collection("houses").doc("house-1").get()
    );
    await assertSucceeds(
      memberUserDb.collection("houses").doc("house-2").get()
    );
    console.log("✅ All authenticated users can read house data\n");

    // Test 4: All authenticated users can read resident data
    console.log("Test 4: Resident data access");
    await headUserDb
      .collection("residents")
      .doc("resident-1")
      .set(testData.residents.resident1);
    await assertSucceeds(
      memberUserDb.collection("residents").doc("resident-1").get()
    );
    console.log("✅ All authenticated users can read resident data\n");

    // Test 5: Only head of family can create residents for their house
    console.log("Test 5: Resident creation permissions");
    const newResident = {
      ...testData.residents.resident1,
      id: "resident-2",
      houseId: "house-1",
      createdBy: "head-user-1",
      updatedBy: "head-user-1",
    };

    await assertSucceeds(
      headUserDb.collection("residents").doc("resident-2").set(newResident)
    );

    // Member should not be able to create residents
    const memberResident = {
      ...testData.residents.resident1,
      id: "resident-3",
      houseId: "house-1",
      createdBy: "member-user-1",
      updatedBy: "member-user-1",
    };
    await assertFails(
      memberUserDb.collection("residents").doc("resident-3").set(memberResident)
    );
    console.log("✅ Only heads of family can create residents\n");

    // Test 6: Head of family cannot create residents for other houses
    console.log("Test 6: Cross-house resident creation");
    const crossHouseResident = {
      ...testData.residents.resident1,
      id: "resident-4",
      houseId: "house-2",
      createdBy: "head-user-1",
      updatedBy: "head-user-1",
    };
    await assertFails(
      headUserDb
        .collection("residents")
        .doc("resident-4")
        .set(crossHouseResident)
    );
    console.log(
      "✅ Heads of family cannot create residents for other houses\n"
    );

    // Test 7: Only head of family can update residents in their house
    console.log("Test 7: Resident update permissions");
    const updatedResident = {
      ...testData.residents.resident1,
      houseName: "Updated House Name",
      updatedBy: "head-user-1",
    };
    await assertSucceeds(
      headUserDb.collection("residents").doc("resident-1").update({
        houseName: "Updated House Name",
        updatedBy: "head-user-1",
      })
    );

    // Member should not be able to update residents
    await assertFails(
      memberUserDb.collection("residents").doc("resident-1").update({
        houseName: "Member Update",
        updatedBy: "member-user-1",
      })
    );
    console.log(
      "✅ Only heads of family can update residents in their house\n"
    );

    // Test 8: Head of family can delete residents from their house
    console.log("Test 8: Resident deletion permissions");
    await assertSucceeds(
      headUserDb.collection("residents").doc("resident-2").delete()
    );
    await assertFails(
      memberUserDb.collection("residents").doc("resident-1").delete()
    );
    console.log(
      "✅ Only heads of family can delete residents from their house\n"
    );

    console.log("🎉 All tests passed! Security rules are working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await testEnv.cleanup();
  }
}

// Export for use in other test files
module.exports = {
  runTests,
  testData,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}
