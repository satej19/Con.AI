import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

import User from '../models/User.model';
import Project from '../models/Project.model';
import Material from '../models/Material.model';
import Supplier from '../models/Supplier.model';
import Inventory from '../models/Inventory.model';
import InventoryTransaction from '../models/InventoryTransaction.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import WasteRecord from '../models/WasteRecord.model';
import ConsumptionPlan from '../models/ConsumptionPlan.model';
import { USER_ROLES, MATERIAL_CATEGORY, MATERIAL_UNIT } from '../config/constants';

const reset = async () => {
  try {
    await mongoose.connect(process.env['MONGO_URI'] || 'mongodb://localhost:27017/material_mgmt');
    console.log('Connected to MongoDB');

    // Clear ALL collections
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Material.deleteMany({}),
      Supplier.deleteMany({}),
      Inventory.deleteMany({}),
      InventoryTransaction.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      WasteRecord.deleteMany({}),
      ConsumptionPlan.deleteMany({}),
    ]);

    console.log('Cleared all collections');

    // Re-create users
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: USER_ROLES.ADMIN,
    });

    const manager = await User.create({
      name: 'Project Manager',
      email: 'manager@example.com',
      password: hashedPassword,
      role: USER_ROLES.MANAGER,
    });

    await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: hashedPassword,
      role: USER_ROLES.USER,
    });

    console.log('Created users');

    // Re-create projects
    await Project.create({
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

    await Project.create({
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

    // Re-create materials
    const materials = await Material.create([
      {
        name: 'Portland Cement',
        code: 'MAT-001',
        category: MATERIAL_CATEGORY.CEMENT,
        unit: MATERIAL_UNIT.BAG,
        description: 'Grade 53 Portland cement',
        hsnCode: '2523',
        reorderLevel: 100,
        isActive: true,
      },
      {
        name: 'Steel Bars TMT',
        code: 'MAT-002',
        category: MATERIAL_CATEGORY.STEEL,
        unit: MATERIAL_UNIT.TON,
        description: '12mm TMT steel bars',
        hsnCode: '7213',
        reorderLevel: 50,
        isActive: true,
      },
      {
        name: 'River Sand',
        code: 'MAT-003',
        category: MATERIAL_CATEGORY.AGGREGATE,
        unit: MATERIAL_UNIT.CUBIC_METRE,
        description: 'Fine river sand for construction',
        hsnCode: '2505',
        reorderLevel: 200,
        isActive: true,
      },
      {
        name: 'PVC Pipes',
        code: 'MAT-004',
        category: MATERIAL_CATEGORY.PIPE,
        unit: MATERIAL_UNIT.METRE,
        description: '4 inch PVC pipes',
        hsnCode: '3917',
        reorderLevel: 150,
        isActive: true,
      },
      {
        name: 'Chemical Treatment',
        code: 'MAT-005',
        category: MATERIAL_CATEGORY.CHEMICAL,
        unit: MATERIAL_UNIT.LITRE,
        description: 'Water treatment chemicals',
        hsnCode: '3824',
        reorderLevel: 50,
        isActive: true,
      },
    ]);

    console.log('Created materials');

    // Re-create suppliers
    await Supplier.insertMany([
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

    console.log('\n✅ Reset complete! All test data cleared.');
    console.log('\nLogin credentials:');
    console.log('  Admin:   admin@example.com / admin123');
    console.log('  Manager: manager@example.com / admin123');
    console.log('  User:    user@example.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting data:', error);
    process.exit(1);
  }
};

reset();
