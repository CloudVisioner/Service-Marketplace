// MongoDB script to fix the Follow collection index mismatch
// Run this in MongoDB shell or MongoDB Compass

// Connect to your database first
// use ServiceMarketplace

print("🔧 Fixing Follow collection index mismatch...");

// Step 1: Drop the old incorrect index
try {
    db.follows.dropIndex("followingId_1_followerId_1");
    print("✅ Dropped old index: followingId_1_followerId_1");
} catch (e) {
    print("ℹ️  Old index not found (may have been already dropped): " + e.message);
}

// Step 2: Clean up any documents with null values
const nullCleanup = db.follows.deleteMany({
    $or: [
        { followerUserId: null },
        { followedOrgId: null },
        { followerUserId: { $exists: false } },
        { followedOrgId: { $exists: false } }
    ]
});
print("✅ Cleaned up " + nullCleanup.deletedCount + " documents with null values");

// Step 3: List all current indexes
print("\n📋 Current indexes on 'follows' collection:");
db.follows.getIndexes().forEach(function(index) {
    print("  - " + index.name + ": " + JSON.stringify(index.key));
});

// Step 4: The correct index should be created automatically by Mongoose
// But we can verify it exists
const correctIndex = db.follows.getIndexes().find(function(idx) {
    return idx.key.followedOrgId === 1 && idx.key.followerUserId === 1;
});

if (correctIndex) {
    print("✅ Correct index exists: " + correctIndex.name);
} else {
    print("⚠️  Correct index not found. Creating it now...");
    db.follows.createIndex(
        { followedOrgId: 1, followerUserId: 1 },
        { unique: true, name: "followedOrgId_1_followerUserId_1" }
    );
    print("✅ Created correct index: followedOrgId_1_followerUserId_1");
}

print("\n✅ Index fix complete! The follow system should now work correctly.");
