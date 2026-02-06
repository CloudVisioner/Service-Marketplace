// MongoDB script to fix the Like collection index mismatch
// Run this in MongoDB shell or MongoDB Compass

// Connect to your database first
// use ServiceMarketplace

print("🔧 Fixing Like collection index mismatch...");

// Step 1: Drop the old incorrect index
try {
    db.likes.dropIndex("memberId_1_likeRefId_1");
    print("✅ Dropped old index: memberId_1_likeRefId_1");
} catch (e) {
    print("ℹ️  Old index not found (may have been already dropped): " + e.message);
}

// Step 2: Clean up any documents with null or old field names
const nullCleanup = db.likes.deleteMany({
    $or: [
        { userId: null },
        { likeRefId: null },
        { userId: { $exists: false } },
        { likeRefId: { $exists: false } },
        { memberId: { $exists: true } } // Remove old documents with memberId
    ]
});
print("✅ Cleaned up " + nullCleanup.deletedCount + " documents with null values or old field names");

// Step 3: List all current indexes
print("\n📋 Current indexes on 'likes' collection:");
db.likes.getIndexes().forEach(function(index) {
    print("  - " + index.name + ": " + JSON.stringify(index.key));
});

// Step 4: The correct index should be created automatically by Mongoose
// But we can verify it exists
const correctIndex = db.likes.getIndexes().find(function(idx) {
    return idx.key.userId === 1 && idx.key.likeRefId === 1;
});

if (correctIndex) {
    print("✅ Correct index exists: " + correctIndex.name);
} else {
    print("⚠️  Correct index not found. Creating it now...");
    db.likes.createIndex(
        { userId: 1, likeRefId: 1 },
        { unique: true, name: "userId_1_likeRefId_1" }
    );
    print("✅ Created correct index: userId_1_likeRefId_1");
}

print("\n✅ Index fix complete! The like system should now work correctly.");
