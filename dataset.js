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

const events = [
    {
        "createdBy": "user123",
        "mainCategory": "Sports",
        "subCategory": "Football",
        "subSubCategory": "Indoor Football",
        "dateOfEvent": "2024-04-10",
        "startTime": "18:00",
        "endTime": "20:00",
        "location": "Indoor Sports Complex",
        "nameOfPlace": "Sports Arena",
        "address": "123 Sports Street",
        "maxParticipants": 20,
        "eventMode": "PUBLIC",
        "ageRange": "18-40",
        "gender": "Any",
        "occupation": "Student",
        "eventTitle": "Indoor Football Match",
        "eventDescription": "Join us for an exciting indoor football match!"
    },
    {
        "createdBy": "admin456",
        "mainCategory": "Music",
        "subCategory": "Concert",
        "subSubCategory": "Rock",
        "dateOfEvent": "2024-04-15",
        "startTime": "20:00",
        "endTime": "23:00",
        "location": "City Amphitheater",
        "nameOfPlace": "Rock Haven",
        "address": "456 Rock Street",
        "maxParticipants": 1000,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Music Enthusiast",
        "eventTitle": "Rock Concert Night",
        "eventDescription": "Experience the ultimate rock concert with live bands!"
    },
    {
        "createdBy": "user789",
        "mainCategory": "Food",
        "subCategory": "Cuisine Festival",
        "subSubCategory": "Italian",
        "dateOfEvent": "2024-04-20",
        "startTime": "12:00",
        "endTime": "16:00",
        "location": "City Park",
        "nameOfPlace": "Taste of Italy",
        "address": "789 Food Avenue",
        "maxParticipants": 500,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Food Lover",
        "eventTitle": "Italian Cuisine Festival",
        "eventDescription": "Savor the authentic flavors of Italy in this culinary celebration!"
    },
    {
        "createdBy": "user321",
        "mainCategory": "Arts",
        "subCategory": "Exhibition",
        "subSubCategory": "Painting",
        "dateOfEvent": "2024-04-25",
        "startTime": "10:00",
        "endTime": "18:00",
        "location": "Art Gallery",
        "nameOfPlace": "Canvas Creations",
        "address": "321 Art Street",
        "maxParticipants": 200,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Art Enthusiast",
        "eventTitle": "Painting Exhibition",
        "eventDescription": "Discover breathtaking artworks from talented painters!"
    },
    {
        "createdBy": "admin123",
        "mainCategory": "Education",
        "subCategory": "Workshop",
        "subSubCategory": "Technology",
        "dateOfEvent": "2024-04-30",
        "startTime": "09:00",
        "endTime": "17:00",
        "location": "Tech Hub",
        "nameOfPlace": "Innovation Center",
        "address": "123 Tech Avenue",
        "maxParticipants": 50,
        "eventMode": "PUBLIC",
        "ageRange": "18-60",
        "gender": "Any",
        "occupation": "Tech Professional",
        "eventTitle": "Tech Workshop: Latest Trends",
        "eventDescription": "Explore the latest trends in technology with industry experts!"
    },
    {
        "createdBy": "user456",
        "mainCategory": "Fitness",
        "subCategory": "Yoga",
        "subSubCategory": "Hatha Yoga",
        "dateOfEvent": "2024-05-05",
        "startTime": "07:00",
        "endTime": "08:30",
        "location": "Yoga Studio",
        "nameOfPlace": "Zen Garden",
        "address": "456 Zen Street",
        "maxParticipants": 30,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Yoga Enthusiast",
        "eventTitle": "Morning Hatha Yoga Session",
        "eventDescription": "Start your day with peace and serenity through Hatha Yoga!"
    },
    {
        "createdBy": "user987",
        "mainCategory": "Entertainment",
        "subCategory": "Movie Screening",
        "subSubCategory": "Comedy",
        "dateOfEvent": "2024-05-10",
        "startTime": "19:30",
        "endTime": "21:30",
        "location": "Cinema Hall",
        "nameOfPlace": "Laugh House",
        "address": "987 Comedy Lane",
        "maxParticipants": 150,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Film Buff",
        "eventTitle": "Comedy Movie Night",
        "eventDescription": "Laugh your heart out with hilarious comedy movies!"
    },
    {
        "createdBy": "admin789",
        "mainCategory": "Health",
        "subCategory": "Wellness",
        "subSubCategory": "Meditation",
        "dateOfEvent": "2024-05-15",
        "startTime": "16:00",
        "endTime": "17:30",
        "location": "Wellness Center",
        "nameOfPlace": "Serenity Spa",
        "address": "789 Wellness Avenue",
        "maxParticipants": 25,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Wellness Enthusiast",
        "eventTitle": "Guided Meditation Session",
        "eventDescription": "Rejuvenate your mind and body with a peaceful meditation session!"
    },
    {
        "createdBy": "user234",
        "mainCategory": "Technology",
        "subCategory": "Conference",
        "subSubCategory": "Artificial Intelligence",
        "dateOfEvent": "2024-05-20",
        "startTime": "10:00",
        "endTime": "17:00",
        "location": "Convention Center",
        "nameOfPlace": "Tech Summit",
        "address": "234 Tech Boulevard",
        "maxParticipants": 500,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Tech Enthusiast",
        "eventTitle": "AI Conference: Future Perspectives",
        "eventDescription": "Explore the future of artificial intelligence with leading experts!"
    },
    {
        "createdBy": "admin321",
        "mainCategory": "Business",
        "subCategory": "Networking Event",
        "subSubCategory": "Entrepreneurship",
        "dateOfEvent": "2024-05-25",
        "startTime": "18:00",
        "endTime": "20:00",
        "location": "Business Hub",
        "nameOfPlace": "Startup Hub",
        "address": "321 Business Street",
        "maxParticipants": 50,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Entrepreneur",
        "eventTitle": "Entrepreneurship Networking",
        "eventDescription": "Connect with fellow entrepreneurs and expand your network!"
    },
    {
        "createdBy": "user567",
        "mainCategory": "Travel",
        "subCategory": "Tour",
        "subSubCategory": "Adventure",
        "dateOfEvent": "2024-05-30",
        "startTime": "09:00",
        "endTime": "18:00",
        "location": "Adventure Park",
        "nameOfPlace": "Explorer's Haven",
        "address": "567 Adventure Avenue",
        "maxParticipants": 40,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Traveler",
        "eventTitle": "Adventure Tour: Nature Trails",
        "eventDescription": "Embark on an exhilarating journey through scenic nature trails!"
    },
    {
        "createdBy": "user012",
        "mainCategory": "Fashion",
        "subCategory": "Fashion Show",
        "subSubCategory": "Haute Couture",
        "dateOfEvent": "2024-06-05",
        "startTime": "19:00",
        "endTime": "21:00",
        "location": "Fashion Pavilion",
        "nameOfPlace": "Glamour House",
        "address": "012 Fashion Street",
        "maxParticipants": 200,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Fashion Enthusiast",
        "eventTitle": "Haute Couture Fashion Show",
        "eventDescription": "Witness the latest trends in haute couture fashion!"
    },
    {
        "createdBy": "admin567",
        "mainCategory": "Gaming",
        "subCategory": "Tournament",
        "subSubCategory": "Esports",
        "dateOfEvent": "2024-06-10",
        "startTime": "14:00",
        "endTime": "20:00",
        "location": "Gaming Arena",
        "nameOfPlace": "Esports Stadium",
        "address": "567 Gaming Street",
        "maxParticipants": 100,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Gamer",
        "eventTitle": "Esports Tournament: Clash of Titans",
        "eventDescription": "Witness epic battles and fierce competition in the world of esports!"
    },
    {
        "createdBy": "user789",
        "mainCategory": "Food",
        "subCategory": "Food Festival",
        "subSubCategory": "Street Food",
        "dateOfEvent": "2024-06-15",
        "startTime": "17:00",
        "endTime": "22:00",
        "location": "Food Street",
        "nameOfPlace": "Street Food Haven",
        "address": "789 Food Lane",
        "maxParticipants": 300,
        "eventMode": "PUBLIC",
        "ageRange": "All",
        "gender": "Any",
        "occupation": "Foodie",
        "eventTitle": "Street Food Festival",
        "eventDescription": "Explore a variety of delectable street foods from around the world!"
    }
];

let userData = () => {
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
    });
}

let eventsData = () => {
    users.forEach(async (user, index) => {
        if (index >= events.length) return console.log("All events created successfully");
        let data = await fetch("http://localhost:8080/api/auth/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: user.username,
                password: user.password
            })
        }).then((res) => res.json());
        let event = events[index];
        let eventData = await fetch("http://localhost:8080/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": data.user.token
            },
            body: JSON.stringify({
                ...event,
                "coverImgUrl": "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxpdmUlMjBldmVudHN8ZW58MHx8MHx8fDA%3D",
                "Img1Url": "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxpdmUlMjBldmVudHN8ZW58MHx8MHx8fDA%3D",
                "Img2Url": "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxpdmUlMjBldmVudHN8ZW58MHx8MHx8fDA%3D",
                "Img3Url": "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxpdmUlMjBldmVudHN8ZW58MHx8MHx8fDA%3D",
                "Img4Url": "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxpdmUlMjBldmVudHN8ZW58MHx8MHx8fDA%3D"
            })
        }).then((res) => res.json());
        if (eventData?.message === "Event created successfully") {
            console.log(`Event ${index + 1} created successfully`);
        } else {
            console.error(`Error creating event ${index + 1}:`, eventData);
        }
    })
}
eventsData();