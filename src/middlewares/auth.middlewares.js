exports.dummyAuthUser = (req, res, next) => {
    req.user = {
        _id: '65a0b2c1d3e4f5a6b7c8d9e0',
        username: 'vo_tan_mock',
        role: 'user'
    };
    next();
};

exports.dummyAuthAdmin = (req, res, next) => {
    req.user = {
        _id: '65a0b2c1d3e4f5a6b7c8d9e1',
        usrename: 'admin_mock',
        role: 'admin'
    };
    next();
}