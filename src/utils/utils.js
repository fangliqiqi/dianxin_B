import { parse, stringify } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { history } from 'umi';
import { message } from 'antd';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export const isUrl = (path) => reg.test(path);
export const isAntDesignPro = () => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }

  return window.location.hostname === 'preview.pro.ant.design';
}; // 给官方演示站点用，用于关闭真实开发环境不需要使用的特性

export const isAntDesignProOrDev = () => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    return true;
  }

  return isAntDesignPro();
};
export const getPageQuery = () => parse(window.location.href.split('?')[1]);
/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */

export const getAuthorityFromRouter = (router = [], pathname='') => {
  const authority = router.find(
    ({ routes, path = '/', target = '_self' }) =>
      (path && target !== '_blank' && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) {
    return authority
  }
  return undefined;
};

export const getRouteAuthority = (path, routeData) => {
  let authorities;
  routeData.forEach((route) => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      } // exact match

      if (route.path === path) {
        authorities = route.authority || authorities;
      } // get children authority recursively

      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

// 判断当前路由是否有权限
export const hasRouter = (path, routeData) => {
  const routers = routeData || [];
  // 手动添加政策管理下的权限
  const res = routers.find(item=>item.path === '/policy');
  if(res){
    routers.push({
      path: '/policy/edit',
      name: '新增政策',
      component: './policy/edit',
      hideInMenu: true,
    })
  }
  let auth = ['no'];
  const callBack = (paths,router) => {
    // eslint-disable-next-line
    for (const item of router){
      if(new RegExp(paths).test(`${item.path}/`)){
        auth = ['user'];
      // eslint-disable-next-line
      }else if(item.children){
        callBack(paths,item.children);
      }
    }
  }
  callBack(path,routers);
  return auth;
}

export const logout = () => {
  const { redirect } = getPageQuery(); // Note: There may be security issues, please note
  localStorage.clear();
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: window.location.href,
      }),
    });
  }
};

// 处理路由函数
export const handleRouterData = (data) => {
  const routers = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of data) {
    const menu = {
      path:item.url,
      name:item.name,
      icon: item.icon,
      component: item.component,
      hideInMenu:item.hidden
    }
    if (item.children && item.children.length > 0) {
      menu.children = [...handleRouterData(item.children)]
    }
    routers.push(menu);
  }
  return routers;
}

// 获取第一个路由作为首页
export const getFirstRouter = (data) => {
  let url = '';
  // eslint-disable-next-line no-restricted-syntax
  for(const item of data){
    if(item.children.length){
      url = item.children[0].url;
    }else{
      url = item.url;
    }
    break;
  }
  return url;
}

// 判断是否有指定路由权限
export const hasAuthRouter = (url,arr) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of arr) {
    if(item.path === url){
      return item;
    }
    if(item.children && item.children.length){
      const res = hasAuthRouter(url,item.children);
      if(res) return res;
    }
  }
}

// 函数防抖
let timer = null;
export const debounce = (fn,wait,val) => {
  if(timer !== null){
    clearTimeout(timer);
  }
  // eslint-disable-next-line func-names
  timer = setTimeout(function(){fn.call(this, val);timer = null;},wait);
}

// 转化树形数组为指定字段
export const handleTreeData = (data,value,title,allowArr,pid,id,extra=title) => {
  const treeData = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of data) {
    let disabled;
    if(allowArr === 'all'){
      disabled = true;
    }else if(allowArr){
      disabled = allowArr.find(elem => elem[value] === item[value]);
      if(pid === item[value]) disabled = true;
      if(id === item[value]) disabled = false;
      // disabled = allowArr ? allowArr.find(elem => elem[value] === item[value]) : false;
    }else{
      disabled = false;
    }
    const resObj = {
      value: item[value],
      title: item[title],
      extra: item[extra],
      disabled: disabled ? false : true
    }
    if (item.children && item.children.length > 0) {
      resObj.children = [...handleTreeData(item.children,value,title,allowArr,pid,id,extra)]
    }
    treeData.push(resObj);
  }
  return treeData;
}

// 处理导入数据 去除空格 最后的空格行
export const handleBlankRow = (data) => {
  // 去除空格
  const newData = data.map(item=>{
    const obj = {};
    Object.keys(item).forEach((elemnt)=>{
      const newKey = (typeof(elemnt)==='string') ? elemnt.trim() : elemnt;
      obj[newKey] = (typeof(item[elemnt])==='string') ? item[elemnt].trim() : item[elemnt]
      if(obj[newKey] === ''){
        delete obj[newKey];
      }
    })
    return obj;
  })
  // 去除最后的空格行
  for (let i=(newData.length-1); i>=0; i--) {
    // 判断数组是否全为空
    const flag = Object.values(newData[i]).find(item=>{
      return String(item).replace(/(^s*)|(s*$)/g, "").length
    })
    if(!flag){
      newData.splice(i, 1)
    }else{
      break
    }
  }
  return newData
}

// 将中文key值转换成指定的英文key值
export const exportFormatJson = (filterVal, jsonData) => {
  const res = jsonData.map(v => filterVal.map(j => {
    return v[j] || '';
  }))
  return res;
}

// 根据1,2转换成指定字段
export const transformMoreFields = (str, obj) => {
  if(str){
    const arr = str.split(',');
    const res = [];
    arr.forEach(item=>{
      res.push(obj[item]);
    })
    return res.join(',');
  }
  return null;
}

// 检查excel模板是否为指定模板  根据第一行标题完全匹配判断
export const realExcelTemplate = (sepcialFileds, fields) => {
  console.log(sepcialFileds, fields)
}

// 查找部门所有父级
export const getParents = (list,id,arr) => {
  const res = list.find(item => String(item.id) === String(id));
  if(res){
    arr.push(res.name);
    if(res.pid > 0){
      getParents(list,res.pid,arr);
    }
  }
  return arr;
}

// 格式化薪酬统计变化 200  ↑  10
export const formatSign = (num,prev,next) => {
  let sign = ' | ';
  switch (num) {
    case '0':
      sign = ' ↓ ';
      break;
    case '2':
      sign = ' ↑ ';
      break;
    default:
      sign = ' | ';
  }
  return `${prev == null ? '-' : prev}${sign}${next==null ? '-' : next}`;
}

// 格式化薪酬统计变化带颜色 200  ↑  10
export const formatSignColor = (num,prev,next,type=0) => {
  let sign = ' | ';
  let fontColor = '#1AAD19';

  switch (num) {
    case '0':
      sign = ' ↓ ';
      fontColor = '#1AAD19';
      break;
    case '2':
      sign = ' ↑ ';
      fontColor = '#FF6E4C';
      break;
    default:
      sign = ' | ';
      if(type && next == null){
        next = '-';
      }
  }
  return ( <span>{prev==null ? '-' : prev}<span style={{color:fontColor}}>{sign}</span>{next==null?'-':next}</span> );
}

// 树形结构 根据指定节点查找所有父级
export const getSpecialParents = (tree,field,val,path) => {
  if(typeof path === 'undefined'){
    path = [];
  }
  for(let i = 0; i < tree.length; i++){
    const tempPath=[...path];
    tempPath.push(tree[i]);
    if(tree[i][field] === val){
      return tempPath;
    }
    if(tree[i].children){
      const reuslt = getSpecialParents(tree[i].children,field,val,tempPath)
      if(reuslt){
        return reuslt;
      }
    }
  }
}

// 该操作是为了解决，输入框有内容时，点击右侧的叉叉清除，点击删除或者其他操作请求列表，已经清空的输入框内容还会存在的问题
export  const resetFormSearch=(formRef,query)=>{
    const  objFrom = formRef.current.getFieldFormatValueObject()
    let numFlag=0
    for (const key in objFrom) {
      if(objFrom[key]){ 
        numFlag++ 
      }
    }
    const {current,pageSize,size,...otherKey}  = query
    let obj = null
    if(numFlag==0){ 
      obj = { current, pageSize,size }
    }
    else{obj = Object.assign({}, { current, pageSize,size},objFrom)}
  return obj
}