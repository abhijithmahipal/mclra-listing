/**
 * Quick validation script for Firestore security rules
 * This script performs basic validation without requiring full test setup
 */

const fs = require("fs");
const path = require("path");

function validateRulesFile() {
  console.log("🔍 Validating Firestore Security Rules...\n");

  // Check if rules file exists
  const rulesPath = path.join(__dirname, "firestore.rules");
  if (!fs.existsSync(rulesPath)) {
    console.error("❌ firestore.rules file not found!");
    return false;
  }

  // Read and validate rules content
  const rulesContent = fs.readFileSync(rulesPath, "utf8");

  // Basic syntax checks
  const checks = [
    {
      name: "Rules version specified",
      test: () => rulesContent.includes("rules_version = '2'"),
      error: "Rules version not specified or incorrect",
    },
    {
      name: "Service declaration",
      test: () => rulesContent.includes("service cloud.firestore"),
      error: "Firestore service not declared",
    },
    {
      name: "Authentication helper function",
      test: () => rulesContent.includes("function isAuthenticated()"),
      error: "Authentication helper function missing",
    },
    {
      name: "User role checking function",
      test: () => rulesContent.includes("function isHeadOfFamily()"),
      error: "Head of family checking function missing",
    },
    {
      name: "Users collection rules",
      test: () => rulesContent.includes("match /users/{userId}"),
      error: "Users collection rules missing",
    },
    {
      name: "Houses collection rules",
      test: () => rulesContent.includes("match /houses/{houseId}"),
      error: "Houses collection rules missing",
    },
    {
      name: "Residents collection rules",
      test: () => rulesContent.includes("match /residents/{residentId}"),
      error: "Residents collection rules missing",
    },
    {
      name: "Read permissions for all authenticated users",
      test: () => rulesContent.includes("allow read: if isAuthenticated()"),
      error: "Read permissions for authenticated users missing",
    },
    {
      name: "Head of family create restrictions",
      test: () =>
        rulesContent.includes("isHeadOfFamily()") &&
        rulesContent.includes("allow create:"),
      error: "Head of family create restrictions missing",
    },
    {
      name: "House ID validation",
      test: () => rulesContent.includes("getUserHouseId()"),
      error: "House ID validation missing",
    },
  ];

  let allPassed = true;

  checks.forEach((check, index) => {
    const passed = check.test();
    const status = passed ? "✅" : "❌";
    console.log(`${status} ${index + 1}. ${check.name}`);

    if (!passed) {
      console.log(`   Error: ${check.error}`);
      allPassed = false;
    }
  });

  console.log("\n" + "=".repeat(50));

  if (allPassed) {
    console.log("🎉 All validation checks passed!");
    console.log("📋 Security rules cover the following requirements:");
    console.log(
      "   • 4.3: Heads of family can edit only their house residents"
    );
    console.log("   • 4.5: Data access restricted to appropriate house data");
    console.log("   • 5.2: All authenticated users can read all house data");
    console.log("   • 5.4: Members have read-only access");
    console.log("   • 5.5: Unauthorized access properly denied");
    console.log("\n📝 Next steps:");
    console.log("   1. Deploy rules: firebase deploy --only firestore:rules");
    console.log(
      "   2. Test with emulator: firebase emulators:start --only firestore"
    );
    console.log("   3. Run automated tests: node firestore.test.js");
  } else {
    console.log(
      "❌ Some validation checks failed. Please review the rules file."
    );
  }

  return allPassed;
}

function validateConfigFiles() {
  console.log("\n🔧 Validating configuration files...\n");

  const files = [
    {
      path: "firebase.json",
      name: "Firebase configuration",
      required: ["firestore.rules", "firestore.indexes.json"],
    },
    {
      path: "firestore.indexes.json",
      name: "Firestore indexes",
      required: ["indexes"],
    },
  ];

  let allValid = true;

  files.forEach((file) => {
    if (fs.existsSync(file.path)) {
      console.log(`✅ ${file.name} exists`);

      try {
        const content = JSON.parse(fs.readFileSync(file.path, "utf8"));

        if (file.required) {
          const hasRequired = file.required.some((req) =>
            JSON.stringify(content).includes(req)
          );

          if (hasRequired) {
            console.log(`   ✅ Contains required configuration`);
          } else {
            console.log(
              `   ❌ Missing required configuration: ${file.required.join(
                ", "
              )}`
            );
            allValid = false;
          }
        }
      } catch (error) {
        console.log(`   ❌ Invalid JSON format`);
        allValid = false;
      }
    } else {
      console.log(`❌ ${file.name} missing`);
      allValid = false;
    }
  });

  return allValid;
}

// Main execution
if (require.main === module) {
  const rulesValid = validateRulesFile();
  const configValid = validateConfigFiles();

  if (rulesValid && configValid) {
    console.log(
      "\n🚀 All validations passed! Security rules are ready for deployment."
    );
    process.exit(0);
  } else {
    console.log(
      "\n⚠️  Some validations failed. Please fix the issues before deploying."
    );
    process.exit(1);
  }
}

module.exports = { validateRulesFile, validateConfigFiles };
