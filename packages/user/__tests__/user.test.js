const request = require('supertest');
const express = require('express');
const { routesConfig } = require('../lib/routes/routes.config'); // Adjust the path accordingly
const IdentityModel = require('../lib/routes/models/identity.model'); // Adjust the path accordingly

// Mock the IdentityModel methods
jest.mock('../lib/routes/models/identity.model');


const app = express();
app.use(express.json()); // for parsing application/json
routesConfig(app); // Initialize your routes

describe('User API Endpoints', () => {
    const mockUser = { 
        firstName: 'John', 
        lastName: 'Doe', 
        birthday: '1990-01-01', 
        userName: 'johndoe', 
        password: 'securepassword',
        permissionLevel: 1,
        isActive: true,
        googleAccessToken: "google-access-token", // Token for Google Calendar API
        googleAccessTokenExpiry: "google-access-token-expiry", // Expiry time for the access token
    };

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should create a new user (POST /users)', async () => {
        IdentityModel.create.mockResolvedValue({ _id: '1', ...mockUser });

        const response = await request(app).post('/users').send(mockUser);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ id: '1' });
        expect(IdentityModel.create).toHaveBeenCalledWith({
            ...mockUser,
            password: expect.any(String), // Password should be hashed
        });
    });

    it('should return 500 when inserting fails (POST /users)', async () => {
        IdentityModel.create.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).post('/users').send(mockUser);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should list all users with pagination (GET /users)', async () => {
        IdentityModel.list.mockResolvedValue([mockUser]);

        const response = await request(app).get('/users');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([mockUser]);
        expect(IdentityModel.list).toHaveBeenCalledWith(10, 0); // Default limit and page
    });

    it('should return 500 when listing users fails (GET /users)', async () => {
        IdentityModel.list.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).get('/users');

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should get user by ID (GET /users/:userId)', async () => {
        IdentityModel.findById.mockResolvedValue(mockUser);

        const response = await request(app).get('/users/1');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockUser);
        expect(IdentityModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when user not found (GET /users/:userId)', async () => {
        IdentityModel.findById.mockResolvedValue(null);

        const response = await request(app).get('/users/1');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: "Identity not found" });
    });

    it('should return 500 when retrieving user by ID fails (GET /users/:userId)', async () => {
        IdentityModel.findById.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).get('/users/1');

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should update user by ID (PUT /users/:userId)', async () => {
        IdentityModel.updateById.mockResolvedValue(mockUser);

        const updatedUser = { ...mockUser, firstName: 'Jane' };
        
        const response = await request(app).put('/users/1').send(updatedUser);

        expect(response.statusCode).toBe(204);
        expect(IdentityModel.updateById).toHaveBeenCalledWith('1', {
            ...updatedUser,
            password: expect.any(String), // Password should be hashed if updated
        });
    });

    it('should return 404 when updating a non-existent user (PUT /users/:userId)', async () => {
        IdentityModel.updateById.mockResolvedValue(null);

        const updatedUser = { ...mockUser, firstName: 'Jane' };
        
        const response = await request(app).put('/users/1').send(updatedUser);

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: "Identity not found" });
    });

    it('should return 500 when updating fails (PUT /users/:userId)', async () => {
        IdentityModel.updateById.mockRejectedValue(new Error('Database Error'));

        const updatedUser = { ...mockUser, firstName: 'Jane' };

        const response = await request(app).put('/users/1').send(updatedUser);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it('should delete user by ID (DELETE /users/:userId)', async () => {
        IdentityModel.removeById.mockResolvedValue(true);

        const response = await request(app).delete('/users/1');

        expect(response.statusCode).toBe(204);
        expect(IdentityModel.removeById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when deleting a non-existent user (DELETE /users/:userId)', async () => {
        IdentityModel.removeById.mockResolvedValue(null);

        const response = await request(app).delete('/users/1');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: "Identity not found" });
    });

    it('should return 500 when deleting fails (DELETE /users/:userId)', async () => {
        IdentityModel.removeById.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).delete('/users/1');

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: "Internal Server Error" });
    });



});
