var startDate = '2/19/2017';
var sun1 = 0.000;
var mon1 = 6.750; // 6.750
var tue1 = 4.250; // 4.250
var wed1 = 0.000;
var thu1 = 0.000;
var fri1 = 5.750; // 5.750
var sat1 = 0.000;

var url = 'https://sm-prd.hcm.umasscs.net/psc/hrprd92/EMPLOYEE/HRMS/c/ROLE_EMPLOYEE.TL_MSS_EE_SRCH_PRD.GBL'
var stateNum = document.getElementsByTagName('iframe')[0].contentWindow.document.getElementById('ICStateNum').value;

var xhr = new XMLHttpRequest();
xhr.open( 'POST', url );
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

xhr.onreadystatechange = ()=>{
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        location.reload();
    }
};

xhr.send(`ICStateNum=${stateNum}&ICAction=TL_LINK_WRK_SUBMIT_PB&DERIVED_TL_WEEK_VIEW_BY_LIST$9$=Z&DATE_DAY1=${startDate}&QTY_DAY1$0=${sun1}&QTY_DAY2$0=${mon1}&QTY_DAY3$0=${tue1}&QTY_DAY4$0=${wed1}&QTY_DAY5$0=${thu1}&QTY_DAY6$0=${fri1}&QTY_DAY7$0=${sat1}`);