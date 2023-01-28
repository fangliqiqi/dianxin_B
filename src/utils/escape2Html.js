
// HTML 标签的反转义方法
export default function escape2Html(str) {

    var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };

    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {

        return arrEntities[t];

    })
}
