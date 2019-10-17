module.exports.messageRes = (statuscode, status, message, res) => {
    return res.status(statuscode).json({
        status,
        message
    });
}
module.exports.dataRes = (statuscode, status, data, res) => {
    return res.status(statuscode).json({
        status,
        data
    });
}