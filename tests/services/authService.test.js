const authService = require('../../src/services/authService');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/config/jwt');

jest.mock('../../src/models/User');
jest.mock('../../src/config/jwt');

test('Register thành công', async () => {
    //Arrange
  User.findOne.mockResolvedValue(null);

  User.hashPassword = jest.fn().mockResolvedValue('hashed123');

  const mockSave = jest.fn();
  User.mockImplementation(() => ({
    save: mockSave,
    _id: '1',
    name: 'Phat',
    email: 'phat@gmail.com',
    avatar: 'https://via.placeholder.com/150',
    role: 'user'
  }));

  generateToken.mockReturnValue('fake-token');

  //Act
  const result = await authService.registerUser({
    name: 'Phat',
    email: 'phat@gmail.com',
    password: '123456'
  });

  //Assert
  expect(result.message).toBe('Registration successful');
  expect(result.token).toBe('fake-token');
  expect(result.user.email).toBe('phat@gmail.com');
});


test('Register thất bại - email đã tồn tại', async () => {
  User.findOne.mockResolvedValue({ email: 'phat@gmail.com' });

  await expect(
    authService.registerUser({
      name: 'Phat',
      email: 'phat@gmail.com',
      password: '123456'
    })
  ).rejects.toThrow('Email already exists');
});

test('Login thành công', async () => {
  const mockUser = {
    _id: '1',
    email: 'phat@gmail.com',
    role: 'user',
    name: 'Phat',
    avatar: 'avatar-url',
    comparePassword: jest.fn().mockResolvedValue(true)
  };

  User.findOne.mockResolvedValue(mockUser); 
  generateToken.mockReturnValue('fake-token');

  const result = await authService.loginUser({
    email: 'phat@gmail.com',
    password: '123456'
  });

  expect(result.message).toBe('Login successful');
  expect(result.token).toBe('fake-token');
});

test('Login thất bại - sai mật khẩu', async () => {
  const mockUser = {
    comparePassword: jest.fn().mockResolvedValue(false)
  };

  User.findOne.mockResolvedValue(mockUser);

  await expect(
    authService.loginUser({
      email: 'phat@gmail.com',
      password: 'wrong'
    })
  ).rejects.toThrow('Invalid email or password');
});

test('Login thất bại - không tồn tại user', async () => {
  User.findOne.mockResolvedValue(null);

  await expect(
    authService.loginUser({
      email: 'notfound@gmail.com',
      password: '123456'
    })
  ).rejects.toThrow('Invalid email or password');
});