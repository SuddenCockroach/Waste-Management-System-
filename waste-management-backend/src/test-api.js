const axios = require("axios");

const baseUrl = "http://localhost:3000";

async function testAPI() {
  try {
    console.log("=== REGISTER USERS ===");

    // Register Admin
    await axios.post(`${baseUrl}/auth/register`, {
      name: "Admin User",
      email: "admin@example.com",
      password: "Password123",
      role: "admin"
    }).catch(() => {}); // ignore if already registered

    // Register Driver
    await axios.post(`${baseUrl}/auth/register`, {
      name: "Driver User",
      email: "driver@example.com",
      password: "Password123",
      role: "driver"
    }).catch(() => {});

    // Register Normal User
    await axios.post(`${baseUrl}/auth/register`, {
      name: "Normal User",
      email: "user@example.com",
      password: "Password123",
      role: "user"
    }).catch(() => {});

    console.log("=== LOGIN ===");

    const adminLogin = await axios.post(`${baseUrl}/auth/login`, {
      email: "admin@example.com",
      password: "Password123"
    });

    const driverLogin = await axios.post(`${baseUrl}/auth/login`, {
      email: "driver@example.com",
      password: "Password123"
    });

    const userLogin = await axios.post(`${baseUrl}/auth/login`, {
      email: "user@example.com",
      password: "Password123"
    });

    const adminToken = adminLogin.data.token;
    const driverToken = driverLogin.data.token;
    const userToken = userLogin.data.token;

    console.log("Admin Token:", adminToken);
    console.log("Driver Token:", driverToken);
    console.log("User Token:", userToken);

    console.log("=== TEST ADMIN ROUTES ===");

    // Add Truck
    const truckRes = await axios.post(`${baseUrl}/trucks`, {
      plate_number: "GH-TR-001",
      capacity: 1000
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("Added Truck:", truckRes.data);

    // Add Route
    const routeRes = await axios.post(`${baseUrl}/routes`, {
      truck_id: truckRes.data.id,
      start_location: "Site A",
      end_location: "Site B",
      schedule: "2025-12-19 08:00:00"
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("Added Route:", routeRes.data);

    // Add QR Code
    const qrRes = await axios.post(`${baseUrl}/qrcodes`, {
      code_value: "QR12345"
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("Added QR Code:", qrRes.data);

    // Add Notification for User
    const notifRes = await axios.post(`${baseUrl}/notifications`, {
      user_id: 3, // Normal User id
      message: "Your waste collection is scheduled for tomorrow"
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("Notification Sent:", notifRes.data);

    console.log("=== TEST USER ROUTES ===");

    // Submit Complaint
    const complaintRes = await axios.post(`${baseUrl}/complaints`, {
      driver_id: 2,
      description: "Driver was late"
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log("Complaint Submitted:", complaintRes.data);

    // Get User Notifications
    const userNotifRes = await axios.get(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log("User Notifications:", userNotifRes.data);

    console.log("=== TEST DRIVER ROUTES ===");

    // Update Collection Status
    const collectionRes = await axios.patch(`${baseUrl}/collection/1`, {
      status: "collected"
    }, {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    console.log("Collection Updated:", collectionRes.data);

    // Get Collection Status for Driver
    const driverCollection = await axios.get(`${baseUrl}/collection`, {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    console.log("Driver Collections:", driverCollection.data);

    console.log("=== ALL TESTS COMPLETED SUCCESSFULLY ===");

  } catch (err) {
    console.error("❌ ERROR:", err.response?.data || err.message);
  }
}

testAPI();
