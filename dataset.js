const users = [
    { username: "john_doe", email: "john.doe@example.com", password: "password1" },
    { username: "jane_smith", email: "jane.smith@example.com", password: "password2" },
    { username: "michael_jackson", email: "michael.jackson@example.com", password: "password3" },
    { username: "emily_watson", email: "emily.watson@example.com", password: "password4" },
    { username: "david_copperfield", email: "david.copperfield@example.com", password: "password5" },
    { username: "susan_brown", email: "susan.brown@example.com", password: "password6" },
    { username: "robert_green", email: "robert.green@example.com", password: "password7" },
    { username: "lisa_white", email: "lisa.white@example.com", password: "password8" },
    { username: "william_black", email: "william.black@example.com", password: "password9" },
    { username: "elizabeth_taylor", email: "elizabeth.taylor@example.com", password: "password10" },
    { username: "samuel_johnson", email: "samuel.johnson@example.com", password: "password11" },
    { username: "sophia_anderson", email: "sophia.anderson@example.com", password: "password12" },
    { username: "nathan_miller", email: "nathan.miller@example.com", password: "password13" },
    { username: "olivia_clark", email: "olivia.clark@example.com", password: "password14" },
    { username: "ethan_harris", email: "ethan.harris@example.com", password: "password15" },
    { username: "alison_wood", email: "alison.wood@gmail.com", password: "helloworld" }
];



users.forEach((user, index) => {
    fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
    }).then((res) => res.json()).then((data) => {
        console.log(`User ${index + 1} created successfully`);
    }).catch((err) => {
        console.error(`Error creating user ${index + 1}:`, err);
    });
})