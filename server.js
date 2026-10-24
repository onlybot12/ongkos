
require("dotenv").config();

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.RAJAONGKIR_API_KEY;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/api/ongkir", async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({
                message: "API key belum diatur di file .env"
            });
        }

        const { origin, destination, weight, courier, price } = req.body;

        if (
            !origin ||
            !destination ||
            !Number.isInteger(Number(weight)) ||
            Number(weight) < 1 ||
            !["jne", "pos", "tiki"].includes(courier) ||
            !["lowest", "highest"].includes(price)
        ) {
            return res.status(400).json({
                message: "Parameter ongkir tidak valid"
            });
        }

        const params = new URLSearchParams({
            origin: String(origin),
            destination: String(destination),
            weight: String(weight),
            courier,
            price
        });

        const response = await axios.post(
            "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost",
            params.toString(),
            {
                headers: {
                    key: API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json"
                },
                timeout: 30000
            }
        );

        res.status(200).json(response.data);

    } catch (error) {
        const status = error.response?.status || 502;

        console.error(
            "RajaOngkir error:",
            error.response?.data || error.message
        );

        res.status(status).json(
            error.response?.data || {
                message: "Gagal menghubungi API RajaOngkir"
            }
        );
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
      
