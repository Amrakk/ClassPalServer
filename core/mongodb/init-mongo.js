db = db.getSiblingDB("ClassPal");

db.User.insertOne({
    name: "Duy Nguyen Hoang",
    email: "hoangduy12823@gmail.com",
    password: "6f770bdc06c9a071:72a1c3c3a4d9ec445503be14f8b589d98f22cadf6a34a27d71ab7a929e3d6039",
    role: "admin",
    status: "normal",
    phoneNumber: "0902529803",
    avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocKSZsuWOmuaWBJSJKqP6phJGtleH6rdgGla3TEVfGPItDBquQ=s96-c",
    updatedAt: new Date(1733747651979),
    createdAt: new Date(1733747651979),
    socialMediaAccounts: [],
    _name: "duy nguyen hoang",
});
