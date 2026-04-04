const mockAuth = (req, res, next) => {
  // GIẢ LẬP: Gán cứng một User ID vào request (Đóng vai trò người dùng đã đăng nhập)
  // LƯU Ý: Em hãy copy cái ObjectId của User "PrimeSound Admin" trong MongoDB của em dán vào đây nhé!
  req.user = { 
    _id: '69b8d84fae6e1af5ad627ba6' // <-- THAY ID NÀY BẰNG ID USER CỦA EM
  };
  next();
};

module.exports = { mockAuth };