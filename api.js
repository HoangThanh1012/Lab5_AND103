const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Kết nối MongoDB Atlas
const uri = "mongodb+srv://hbtezx:thanh1012@cluster0.rm5n6.mongodb.net/distributorsDB";
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

// Middleware để parse dữ liệu JSON trong body request
app.use(express.json());

// Định nghĩa schema cho Distributor
const distributorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Tạo model Distributor
const Distributor = mongoose.model('Distributor', distributorSchema);

// Route API GET để lấy danh sách distributors
app.get('/get-list-distributor', async (req, res) => {
    try {
        // Lấy dữ liệu từ MongoDB và sắp xếp theo createdAt
        const data = await Distributor.find().sort({ createdAt: -1 });
        console.log(data);  // In ra dữ liệu để kiểm tra

        if (data.length > 0) {
            res.json({
                status: 200,
                messenger: "Thành công",
                data: data
            });
        } else {
            res.json({
                status: 400,
                messenger: "Lỗi, không thành công",
                data: []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Route API POST để thêm distributor mới
app.post('/add-distributor', async (req, res) => {
    try {
        const { name } = req.body;  // Lấy name từ request body

        if (!name) {
            return res.status(400).json({
                status: 400,
                messenger: "Tên không được để trống",
            });
        }

        // Tạo mới distributor
        const newDistributor = new Distributor({
            name: name,
        });

        // Lưu vào MongoDB
        const savedDistributor = await newDistributor.save();
        
        res.status(201).json({
            status: 201,
            messenger: "Thêm distributor thành công",
            data: savedDistributor
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/distributors', async (req, res) => {
    const { name } = req.query;  // Lấy giá trị từ query parameter
    let distributors;

    if (name) {
        // Tìm kiếm theo tên nhà phân phối
        distributors = await Distributor.find({ name: { $regex: name, $options: 'i' } });
    } else {
        // Nếu không có tên tìm kiếm, trả về tất cả
        distributors = await Distributor.find();
    }

    res.json(distributors);
});

// Chạy server trên port 3001
app.listen(3001, () => console.log('Server running on http://localhost:3001'));
