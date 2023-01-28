export default {
  // 支持值为 Object 和 Array
  'POST /api/auth/captcha': (req, res) => {
    res.status(200).send({
      code: 200,
      msg: '验证码发送成功',
    });
  },
};
