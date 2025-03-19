db = db.getSiblingDB("ClassPal");

db.User.insertOne({
    _id: ObjectId("678dfc60cd7db88d12eaaa58"),
    name: "Đinh Hoàng Phúc",
    _name: "dinh hoang phuc",
    email: "phucdinn1803@gmail.com",
    password: "$2b$10$0UfuptHPmo13YAVSHCULUu6VFKoqsHY7YXyuR4D1R/Fw5vugSgXKa",
    phoneNumber: "0979420024",
    avatarUrl: "https://i.ibb.co/DKcyw0Q/ef4b64d30186.png",
    role: 1,
    status: 0,
    socialMediaAccounts: [],
    createdAt: new Date("2025-01-20T07:33:52.364Z"),
    updatedAt: new Date("2025-02-19T17:55:47.672Z"),
});
