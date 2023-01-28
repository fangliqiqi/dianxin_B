
export default () => {
  // const menuList = JSON.parse(localStorage.getItem('menuList'));

  return {
    canReadFoo: true,
    canUpdateFoo: () => true,
    // canDeleteFoo: (data) => data?.status < 1, // 按业务需求自己任意定义鉴权函数
  };
}