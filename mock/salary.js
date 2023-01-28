export default {
  // 获取薪酬工资表
  'GET /api/salary/customerBusiness/businessSalary/getSettlementFormVoPage': { "code": 200, "msg": "success", "data": { "records": [{ "salaryMonth": "202006", "personTime": "758.00", "salarySum": "2933183.16", "cardPay": "2651100.76", "years": null, "laborCosts": null }, { "salaryMonth": "202005", "personTime": "755.00", "salarySum": "3283739.11", "cardPay": "3018157.68", "years": null, "laborCosts": null }, { "salaryMonth": "202004", "personTime": "741.00", "salarySum": "2673506.36", "cardPay": "2424409.33", "years": null, "laborCosts": null }, { "salaryMonth": "202003", "personTime": "717.00", "salarySum": "2772292.15", "cardPay": "2533786.82", "years": null, "laborCosts": null }, { "salaryMonth": "202002", "personTime": "690.00", "salarySum": "2129388.65", "cardPay": "1881037.22", "years": null, "laborCosts": null }, { "salaryMonth": "202001", "personTime": "707.00", "salarySum": "2506647.95", "cardPay": "2260282.83", "years": null, "laborCosts": null }], "total": 6, "size": 10, "current": 1, "orders": [], "searchCount": true, "pages": 1 }, "errorMessageList": null },

  // 工资详情-获取项目报账列表
  'GET /api/salary/customerBusiness/businessSalary/getSalaryAccountAndItemVoPage': {
    "code": 0,
    "data": {
      "current": 0,
      "pages": 0,
      "records": [
        {
          "actualSalarySum": "string",
          "deduProvidentMonth": "string",
          "deduSocialMonth": "string",
          "distributionFlag": "string",
          "empIdcard": "string",
          "empName": "string",
          "id": "string",
          "relaySalary": "string",
          "saiList": [
            {
              "cnName": "string",
              "id": "string",
              "isTax": 0,
              "javaFiedName": "string",
              "salaryAccountId": "string",
              "salaryMoney": 0
            }
          ],
          "salaryDate": "string",
          "salaryFormId": "string",
          "salaryGiveTime": "string",
          "salaryTax": "string",
          "salaryType": "string",
          "settlementMonth": "string",
          "years": "string"
        }
      ],
      "searchCount": true,
      "size": 0,
      "total": 0
    },
    "errorMessageList": [
      {
        "color": "string",
        "line": 0,
        "message": "string"
      }
    ],
    "msg": "string"
  },

  // // 获取报账列表
  'GET /api/salary/customerBusiness/businessSalary/getSalaryStandardPage': {
    "code": 200, "msg": "success", "data": { "records": [{ "id": 0, 'status': 0, 'departName': '部门名称', 'settlementAmount': '结算金额', 'formType': '2', 'moneyFrom': '款项来源', 'revenueTime': '2020-90-09' }, { "id": 1, 'status': 0, 'departName': '部门名称', 'settlementAmount': '结算金额', 'formType': '2', 'moneyFrom': '款项来源', 'revenueTime': '2020-90-09' }, { "id": 2, 'status': 0, 'departName': '部门名称', 'settlementAmount': '结算金额', 'formType': '2', 'moneyFrom': '款项来源', 'revenueTime': '2020-90-09' }, { "id": 3, 'status': 0, 'departName': '部门名称', 'settlementAmount': '结算金额', 'formType': '2', 'moneyFrom': '款项来源', 'revenueTime': '2020-90-09' }] }
  },

  // 工资详情-获取详情上的统计
  'GET /api/salary/customerBusiness/businessSalary/getSettlementStasticsBySalaryFormId':{"code":200,"msg":"success","data":{"salaryMonth":null,"personTime":"121.00","salarySum":"589426.44","cardPay":"545008.33","years":null,"laborCosts":"614578.72"},"errorMessageList":null},
  
}
