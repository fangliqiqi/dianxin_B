# Ant Design Pro

This project is initialized with [Ant Design Pro](https://pro.ant.design). Follow is the quick guide for how to use.

## Environment Prepare

Install `node_modules`:

```bash
npm install
```

or

```bash
yarn
```

## Provided Scripts

Ant Design Pro provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

### Start project

```bash
npm start
```

### Build project

```bash
npm run build
```

### Check code style

```bash
npm run lint
```

You can also use script to auto fix some lint error:

```bash
npm run lint:fix
```

### Test code

```bash
npm test
```

## More

You can view full document on our [official website](https://pro.ant.design). And welcome any feedback in our [github](https://github.com/ant-design/ant-design-pro).

## test11

## Menu
BUG: 后台获取配置左侧菜单，第一次进入以及刷新页面，选中菜单未高亮，点击选中，刷新浏览器后，选中样式消失；但是用本地配置的菜单就没有问题
复现步骤：
1、package.json中的prolayout 版本升级到6.2以上
2、在BasicLayout.jsx中的loopMenuItem方法里使用网络获取的菜单配置
期望结果：
菜单选中高亮，刷新后高亮样式不消失。默认选中的页，菜单项要高亮显示。

经过反复测试，推测及验证是prolayout高版本（6.2以上）的bug
解决方法：降低版本库，使用prolayout，5.0.8的版本
注意事项：版本降低后菜单的类名不一致导致样式有些影响，需要根据对应修改添加等。

详情见问题链接:
https://github.com/ant-design/ant-design-pro-layout/issues/580