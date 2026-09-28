"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Material_model_1 = __importDefault(require("../models/Material.model"));
const Supplier_model_1 = __importDefault(require("../models/Supplier.model"));
const constants_1 = require("../config/constants");
const seed = async () => {
    try {
        await mongoose_1.default.connect(process.env['MONGO_URI'] || 'mongodb://localhost:27017/material-management');
        console.log('Connected to MongoDB');
        // Clear existing data
        await User_model_1.default.deleteMany({});
        await Project_model_1.default.deleteMany({});
        await Material_model_1.default.deleteMany({});
        await Supplier_model_1.default.deleteMany({});
        console.log('Cleared existing data');
        // Create users
        const hashedPassword = await bcryptjs_1.default.hash('admin123', 10);
        await User_model_1.default.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: constants_1.USER_ROLES.ADMIN,
        });
        const manager = await User_model_1.default.create({
            name: 'Project Manager',
            email: 'manager@example.com',
            password: hashedPassword,
            role: constants_1.USER_ROLES.MANAGER,
        });
        await User_model_1.default.create({
            name: 'Store Keeper',
            email: 'store@example.com',
            password: hashedPassword,
            role: constants_1.USER_ROLES.STORE_KEEPER,
        });
        await User_model_1.default.create({
            name: 'Site Engineer',
            email: 'engineer@example.com',
            password: hashedPassword,
            role: constants_1.USER_ROLES.ENGINEER,
        });
        console.log('Created users');
        // Create projects
        await Project_model_1.default.create({
            name: 'Water Treatment Plant Phase 1',
            code: 'WTP-P1',
            description: 'First phase of water treatment plant construction',
            location: 'Industrial Zone A',
            status: 'active',
            startDate: new Date('2024-01-01'),
            expectedEndDate: new Date('2024-12-31'),
            budget: 5000000,
            managerId: manager._id,
        });
        await Project_model_1.default.create({
            name: 'Water Treatment Plant Phase 2',
            code: 'WTP-P2',
            description: 'Second phase of water treatment plant construction',
            location: 'Industrial Zone B',
            status: 'planning',
            startDate: new Date('2025-01-01'),
            expectedEndDate: new Date('2025-12-31'),
            budget: 6000000,
            managerId: manager._id,
        });
        console.log('Created projects');
        // Create materials
        const materials = await Material_model_1.default.create([
            {
                name: 'Portland Cement',
                code: 'MAT-001',
                category: constants_1.MATERIAL_CATEGORY.CEMENT,
                unit: constants_1.MATERIAL_UNIT.BAG,
                description: 'Grade 53 Portland cement',
                hsnCode: '2523',
                reorderLevel: 100,
                isActive: true,
            },
            {
                name: 'Steel Bars TMT',
                code: 'MAT-002',
                category: constants_1.MATERIAL_CATEGORY.STEEL,
                unit: constants_1.MATERIAL_UNIT.TON,
                description: '12mm TMT steel bars',
                hsnCode: '7213',
                reorderLevel: 50,
                isActive: true,
            },
            {
                name: 'River Sand',
                code: 'MAT-003',
                category: constants_1.MATERIAL_CATEGORY.AGGREGATE,
                unit: constants_1.MATERIAL_UNIT.CUBIC_METRE,
                description: 'Fine river sand for construction',
                hsnCode: '2505',
                reorderLevel: 200,
                isActive: true,
            },
            {
                name: 'PVC Pipes',
                code: 'MAT-004',
                category: constants_1.MATERIAL_CATEGORY.PIPE,
                unit: constants_1.MATERIAL_UNIT.METRE,
                description: '4 inch PVC pipes',
                hsnCode: '3917',
                reorderLevel: 150,
                isActive: true,
            },
            {
                name: 'Chemical Treatment',
                code: 'MAT-005',
                category: constants_1.MATERIAL_CATEGORY.CHEMICAL,
                unit: constants_1.MATERIAL_UNIT.LITRE,
                description: 'Water treatment chemicals',
                hsnCode: '3824',
                reorderLevel: 50,
                isActive: true,
            },
        ]);
        console.log('Created materials');
        // Create suppliers
        await Supplier_model_1.default.insertMany([
            {
                name: 'ABC Cement Supplies',
                code: 'SUP-001',
                contactPerson: 'John Doe',
                email: 'john@abccement.com',
                phone: '+1234567890',
                address: '123 Industrial Area',
                gstNumber: 'GST12345678',
                materialsSupplied: [materials[0]?._id],
                rating: 4.5,
                isActive: true,
            },
            {
                name: 'Steel Traders Ltd',
                code: 'SUP-002',
                contactPerson: 'Jane Smith',
                email: 'jane@steeltraders.com',
                phone: '+1234567891',
                address: '456 Steel Market',
                gstNumber: 'GST87654321',
                materialsSupplied: [materials[1]?._id],
                rating: 4.2,
                isActive: true,
            },
            {
                name: 'Construction Materials Co',
                code: 'SUP-003',
                contactPerson: 'Bob Johnson',
                email: 'bob@constmaterials.com',
                phone: '+1234567892',
                address: '789 Construction Hub',
                gstNumber: 'GST11223344',
                materialsSupplied: [materials[2]?._id, materials[3]?._id],
                rating: 4.0,
                isActive: true,
            },
        ]);
        console.log('Created suppliers');
        console.log('Seed data created successfully!');
        console.log('\nLogin credentials:');
        console.log('Admin: admin@example.com / admin123');
        console.log('Manager: manager@example.com / admin123');
        console.log('Store Keeper: store@example.com / admin123');
        console.log('Engineer: engineer@example.com / admin123');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=seed.js.map