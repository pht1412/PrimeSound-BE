const User = require('../../src/models/User');
const userService = require('../../src/services/userService');
const { AppError } = require('../../src/utils/AppError');

jest.mock('../../src/models/User');

//getCurrentUser
test('getCurrentUser - trả về user khi tồn tại', async () => {
  const mockUser = {
    _id: '1',
    name: 'Phat',
    email: 'phat@gmail.com'
  };

  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(mockUser)
  });

  const result = await userService.getCurrentUser('1');

  expect(result).toEqual(mockUser);
});

test('getCurrentUser - thất bại khi user không tồn tại', async () => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(null)
  });

  await expect(
    userService.getCurrentUser('999')
  ).rejects.toThrow('User not found');
});

//getUserById
test('getUserById - trả về user khi tồn tại', async () => {
  const mockUser = {
    _id: '1',
    name: 'Phat',
    email: 'phat@gmail.com'
  };

  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(mockUser)
  });

  const result = await userService.getUserById('1');

  expect(result).toEqual(mockUser);
});

test('getUserById - trả về null khi không tồn tại', async () => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(null)
  });

  const result = await userService.getUserById('999');

  expect(result).toBeNull();
});

//updateUserById
test('updateUserById - thất bại khi user không tồn tại', async () => {
  User.findById.mockResolvedValue(null);

  await expect(
    userService.updateUserById('1', { name: 'New Name' })
  ).rejects.toThrow('User not found');
});

test('updateUserById - cập nhật user thành công', async () => {
  const mockUser = {
    _id: '1',
    name: 'Old Name',
    email: 'old@gmail.com',
    role: 'user',
    save: jest.fn()
  };

  const updatedUser = {
    _id: '1',
    name: 'New Name',
    email: 'new@gmail.com',
    role: 'admin'
  };

  // mock 2 lần gọi
  User.findById
    .mockResolvedValueOnce(mockUser)
    .mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(updatedUser)
    });

  const result = await userService.updateUserById('1', {
    name: 'New Name',
    email: 'new@gmail.com',
    role: 'admin'
  });

  expect(mockUser.save).toHaveBeenCalled();
  expect(result.message).toBe('User updated');
  expect(result.user).toEqual(updatedUser);
});

//deleteUserById
test('deleteUserById - thất bại khi user không tồn tại', async () => {
  User.findById.mockResolvedValue(null);

  await expect(
    userService.deleteUserById('1')
  ).rejects.toThrow('User not found');
});

test('deleteUserById - xóa user thành công', async () => {
  const mockUser = { _id: '1', name: 'Phat' };

  User.findById.mockResolvedValue(mockUser);
  User.findByIdAndDelete.mockResolvedValue();

  const result = await userService.deleteUserById('1');

  expect(User.findById).toHaveBeenCalledWith('1');
  expect(User.findByIdAndDelete).toHaveBeenCalledWith('1');
  expect(result.message).toBe('User deleted');
});

//changePassword
test('changePassword - thiếu input', async () => {
  await expect(
    userService.changePassword('1', null, '123456')
  ).rejects.toThrow('Please provide old and new password');
});

test('changePassword - user không tồn tại', async () => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(null)
  });

  await expect(
    userService.changePassword('1', 'old', 'new')
  ).rejects.toThrow('User not found');
});

test('changePassword - sai mật khẩu cũ', async () => {
  const mockUser = {
    comparePassword: jest.fn().mockResolvedValue(false)
  };

  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(mockUser)
  });

  await expect(
    userService.changePassword('1', 'wrong', 'new')
  ).rejects.toThrow('Current password is incorrect');
});

test('changePassword - thành công', async () => {
  const mockUser = {
    password: 'old-hash',
    comparePassword: jest.fn().mockResolvedValue(true),
    save: jest.fn()
  };

  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(mockUser)
  });

  User.hashPassword = jest.fn().mockResolvedValue('new-hash');

  const result = await userService.changePassword('1', 'old', 'new');

  expect(mockUser.comparePassword).toHaveBeenCalledWith('old');
  expect(User.hashPassword).toHaveBeenCalledWith('new');
  expect(mockUser.save).toHaveBeenCalled();
  expect(result.message).toBe('Password updated successfully');
});