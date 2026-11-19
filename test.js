import { json, perfiosJson } from '../perfios.js';
import { parseString } from 'xml2js';
import fs from 'fs';
import {
  inwardBouncesMonth,
  outwardBouncesMonth,
  totalCreditMonth,
  numberOfCreditMonth,
  numberOfDebitsMonth,
  inwardPercentMonth,
  outwardPercentMonth,
  totalZeroCreditMonth,
  existingLoanObligationMonth,
  avgbankBalMonth,
  monthlyIncomeSalaryMonth,
} from './perfiosConfig.js';
import DmsService from '../services/DmsService.js';
import moment from 'moment';
import { xmlResponse } from './perfiosXml.js';

const minIncome_2 = async (minIncomeData, cust_type) => {
  let minIncomeSum = 0;
  let minIncomeCount = 0;
  let customer_type = cust_type === 'SALARIED' ? 'totalSalary' : 'balAvg'; // swaping tags based on the customer category
  for (let i = 0; i < minIncomeData.length; i++) {
    const now = new Date();
    const then = new Date(minIncomeData[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    if (msBetweenDates <= monthlyIncomeSalaryMonth) {
      // console.log(msBetweenDates, "msBetweenDates");
      if (Math.floor(Number(minIncomeData[i]['$'][customer_type])) > 0) {
        minIncomeCount = minIncomeCount + 1;
        minIncomeSum = minIncomeSum + Math.floor(Number(minIncomeData[i]['$'][customer_type]));
      }
    }
  }

  if (minIncomeCount > 0) {
    // console.log(minIncomeSum, minIncomeCount, "minIncomeData");
    return Math.floor(minIncomeSum / 3).toString();
  } else {
    console.log(minIncomeCount, 'minIncomeCount is less than 1');
    return 0;
  }
};

const avgBankBalance_2 = async (avgBankBalanceData) => {
  let avgBankBalanceSum = 0;
  let avgBankBalanceCount = 0;
  let monthlyDetailArrr = [];
  for (let i = 0; i < avgBankBalanceData.length; i++) {
    const now = new Date();
    const then = new Date(avgBankBalanceData[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    if (msBetweenDates <= avgbankBalMonth) {
      // console.log(msBetweenDates,"msBetweenDates")
      if (Math.floor(Number(avgBankBalanceData[i]['$']['balAvg'])) > 0) {
        avgBankBalanceCount = avgBankBalanceCount + 1;
        avgBankBalanceSum =
          avgBankBalanceSum + Math.floor(Number(avgBankBalanceData[i]['$']['balAvg']));
      }
    }
  }

  if (avgBankBalanceCount >= 4) {
    console.log(avgBankBalanceCount, avgBankBalanceSum, 'avgBankBalanceCount');
    return Math.floor(avgBankBalanceSum / avgBankBalanceCount);
  } else {
    console.log(avgBankBalanceCount, 'Bank Balance count is less than 4 months');
    return 0;
  }
};

const annualbankingcredits_2 = async (monthlyDetailsSegment, dataHeader) => {
  let totalCreditSum = 0;
  let monthlyDetailArrr = [];
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (!dataHeader?.abb_months) {
      if (
        msBetweenDates <= totalCreditMonth // total Credit Month
      ) {
        //   console.log(
        //     Number(monthlyDetailsSegment[i]["$"]["totalCredit"]),
        //     msBetweenDates
        //   );
        totalCreditSum = totalCreditSum + Number(monthlyDetailsSegment[i]['$']['totalCredit']);
      }
    } else {
      if (
        msBetweenDates <=
        Number(dataHeader?.abb_months) - 1 // total Credit Month
      ) {
        console.log('credits', monthlyDetailsSegment[i]['$']['monthName'], msBetweenDates);
        totalCreditSum = totalCreditSum + Number(monthlyDetailsSegment[i]['$']['totalCredit']);
      }
    }
  }
  console.log('totalCreditSum:', totalCreditSum);
  return Math.floor(totalCreditSum).toString();
};

const inwardChequeBouncesCount_2 = async (monthlyDetailsSegment) => {
  let monthlyDetailArrr = [];
  let inwardBouncesCount = 0;

  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    // console.log(monthlyDetailsSegment[i]["$"]["startDate"]);
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (msBetweenDates <= inwardBouncesMonth) {
      //   console.log(i,msBetweenDates);
      inwardBouncesCount = inwardBouncesCount + Number(monthlyDetailsSegment[i]['$']['inwBounces']);
    }
  }
  console.log('inwardBouncesCount:', inwardBouncesCount);
  return inwardBouncesCount;
};

const inwardPercentage_2 = async (monthlyDetailsSegment) => {
  let monthlyDetailArrr = [];
  let totalDebitsSum = 0;
  let totalInwardBounces = 0;
  let inwardPercentageResult = 0;
  for (const a in monthlyDetailsSegment) {
    // console.log(monthlyDetailsSegment[a], "test");
    totalDebitsSum = totalDebitsSum + Number(monthlyDetailsSegment[a]['$']['debits']);
    totalInwardBounces = totalInwardBounces + Number(monthlyDetailsSegment[a]['$']['inwBounces']);
  }
  console.log('totalDebitsSum:', totalDebitsSum, 'totalInwardBounces:', totalInwardBounces);

  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);

    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (
      msBetweenDates <= inwardPercentMonth &&
      totalDebitsSum > 10 // Inward Cheque bounces month to be changed
    ) {
      //   console.log(totalDebitsSum, msBetweenDates);
      inwardPercentageResult = totalInwardBounces / totalDebitsSum;
    }
  }
  console.log('inwardPercentageResult:', inwardPercentageResult);
  return inwardPercentageResult;
};

const outwardChequeBouncesCount_2 = async (monthlyDetailsSegment) => {
  let monthlyDetailArrr = [];
  let outwardBouncesCount = 0;
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    // console.log(monthlyDetailsSegment[i]["$"]["startDate"]);
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (
      msBetweenDates <= outwardBouncesMonth // Outward Cheque bounces month to be changed
    ) {
      //   console.log(i,msBetweenDates);
      outwardBouncesCount =
        outwardBouncesCount + Number(monthlyDetailsSegment[i]['$']['outwBounces']);
    }
  }
  console.log('outwardBouncesCount:', outwardBouncesCount);
  return outwardBouncesCount;
};

const outwardPercentage_2 = async (monthlyDetailsSegment) => {
  let monthlyDetailArrr = [];
  let totalCreditsSum = 0;
  let totaloutwardBounces = 0;
  let outwardPercentageResult = 0;
  for (const a in monthlyDetailsSegment) {
    totalCreditsSum = totalCreditsSum + Number(monthlyDetailsSegment[a]['$']['credits']);
    totaloutwardBounces =
      totaloutwardBounces + Number(monthlyDetailsSegment[a]['$']['outwBounces']);
  }
  console.log('totalCreditsSum:', totalCreditsSum, 'totaloutwardBounces:', totaloutwardBounces);

  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);

    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (
      msBetweenDates <= outwardPercentMonth &&
      totalCreditsSum > 10 // Inward Cheque bounces month to be changed
    ) {
      //   console.log(totalCreditsSum, msBetweenDates);
      outwardPercentageResult = totaloutwardBounces / totalCreditsSum;
    }
  }
  console.log('outwardPercentageResult:', outwardPercentageResult);
  return outwardPercentageResult;
};

const numberOfCredits_2 = async (monthlyDetailsSegment) => {
  let monthlyDetailArrr = [];
  let sumOfCredits = 0;
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (
      msBetweenDates <= numberOfCreditMonth // Inward Cheque bounces month to be changed
    ) {
      // console.log(i, msBetweenDates);
      sumOfCredits = sumOfCredits + Number(monthlyDetailsSegment[i]['$']['credits']);
    }
  }
  console.log('sumOfCredits:', sumOfCredits);
  return sumOfCredits;
};

const numberOfDebits_2 = async (monthlyDetailsSegment) => {
  let monthlyDetailArrr = [];
  let sumOfDebits = 0;
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (
      msBetweenDates <= numberOfDebitsMonth // Inward Cheque bounces month to be changed
    ) {
      //   console.log(i, msBetweenDates);
      sumOfDebits = sumOfDebits + Number(monthlyDetailsSegment[i]['$']['debits']);
    }
  }
  console.log('sumOfDebits:', sumOfDebits);
  return sumOfDebits;
};

const CountOfZeroCreditMonth_2 = async (monthlyDetailsSegment) => {
  let totalCreditZeroCreditSum = 0;
  let monthlyDetailArrr = [];
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (
      msBetweenDates <= totalZeroCreditMonth &&
      Number(monthlyDetailsSegment[i]['$']['credits']) === 0
    ) {
      totalCreditZeroCreditSum += 1;
    }
    // console.log(monthlyDetailsSegment[i]["$"]["credits"]);
  }
  console.log('totalZeroCreditSum:', totalCreditZeroCreditSum);
  return totalCreditZeroCreditSum;
};

const existingLoanobligation_2 = async (existingLoanObligationData) => {
  let existingLoanObligationSum = 0;
  let exisingLoanObligationCount = 0;
  let monthlyDetailArrr = [];

  for (let i = 0; i < existingLoanObligationData.length; i++) {
    const now = new Date();
    const then = new Date(existingLoanObligationData[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    if (msBetweenDates === 1) {
      exisingLoanObligationCount = exisingLoanObligationCount + 1;
      existingLoanObligationSum =
        existingLoanObligationSum +
        Math.floor(Number(existingLoanObligationData[i]['$']['totalEmiOrLoan']));
    }
  }
  return Math.floor(existingLoanObligationSum);
};

const getMonthDetails = async (perfiosResult, fullData, perfiosAccountNo) => {
  console.log(perfiosAccountNo, 'perfiosAccountNo');
  let monthCountArr = [],
    startDate = '',
    endDate = '',
    finalMonthRange = [];
  let statementDetails = fullData['PIR:Data']?.['Statementdetails'][0]['Statement'];
  for (let i = 0; i < statementDetails.length; i++) {
    // console.log(statementDetails[i]["StatementAccounts"][0]["StatementAccount"][0]["$"]["accountNo"], "statementDetails")
    if (
      statementDetails[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['accountNo'] ===
      perfiosAccountNo
    ) {
      if (i === 0) {
        startDate =
          statementDetails[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsStartDate'];
        endDate =
          statementDetails[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsEndDate'];
      } else {
        if (
          new Date(startDate) >
          new Date(
            statementDetails[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsStartDate']
          )
        ) {
          startDate =
            statementDetails[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsStartDate'];
        }
        if (
          new Date(endDate) <
          new Date(
            statementDetails[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsEndDate']
          )
        ) {
          endDate =
            statementDetails[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsEndDate'];
        }
        if (startDate === '' && endDate === '') {
          startDate =
            statementDetails[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsStartDate'];
          endDate =
            statementDetails[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsEndDate'];
        }
      }
    }
  }
  console.log(startDate, 'startDate', endDate, 'endDate');
  let computedDate =
    new Date(endDate).getMonth() -
    new Date(startDate).getMonth() +
    12 * (new Date(endDate).getFullYear() - new Date(startDate).getFullYear());
  console.log(computedDate, 'computedDates');
  let range = await createMonthRange();
  if (computedDate >= 6) {
    let startMonth = new Date(startDate).toLocaleString('en-GB', {
      month: 'short',
      year: 'numeric',
    });
    startMonth =
      startMonth.length > 8
        ? startMonth.substring(0, 3) + '-' + startMonth.substring(7, 9)
        : startMonth.substring(0, 3) + '-' + startMonth.substring(6, 8);
    let endMonth = new Date(endDate).toLocaleString('en-GB', {
      month: 'short',
      year: 'numeric',
    });
    endMonth =
      endMonth.length > 8
        ? endMonth.substring(0, 3) + '-' + endMonth.substring(7, 9)
        : endMonth.substring(0, 3) + '-' + endMonth.substring(6, 8);
    let computedMonthRange = await createDynamicMonthRange(computedDate, startDate);
    for (let i = 0; i < computedMonthRange.length; i++) {
      if (range.includes(computedMonthRange[i])) {
        finalMonthRange.push(computedMonthRange[i]);
      }
    }
    console.log(finalMonthRange[0], 'finalMonthRange[finalMonthRange.length - 1]');
    const [monthStr, yearStr] = finalMonthRange[0].split('-');

    // Convert month abbreviation to a number
    const monthMap = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const month = monthMap[monthStr];

    // Parse the year as a 4-digit number (assuming 'YY' represents '20YY')
    const year = parseInt(yearStr, 10) + 2000;
    // Get the ISO formatted date string
    const isoDate = `${year}-${month < 9 ? '0' : ''}${month + 1}-01`;
    startDate = isoDate;
  } else {
    let computedMonthRange = await createDynamicMonthRange(computedDate, startDate);
    for (let i = 0; i < computedMonthRange.length; i++) {
      if (range.includes(computedMonthRange[i])) {
        finalMonthRange.push(computedMonthRange[i]);
      }
    }
    // console.log(range, computedMonthRange, "range")
  }
  // for (let i = 0; i < perfiosResult.length; i++) {
  //     if (Number(perfiosResult[i]["$"]["xnsCount"]) > 0)
  //         monthCountArr.push(perfiosResult[i]["$"]["monthName"])
  // }
  // console.log(monthCountArr, "monthcountArr")
  return { finalMonthRange, startDate, endDate };
};

const createMonthRange = async () => {
  let arr = [];
  let maximumMonth = 13;
  for (let i = 1; i <= maximumMonth; i++) {
    var makeDate = new Date();
    // makeDate.setMonth(makeDate.getMonth() - i);
    makeDate = moment(new Date()).subtract(i, 'months').format('MMM-YY');
    // makeDate = new Date(makeDate).toLocaleString('en-GB', { month: 'short', year: 'numeric' })
    // console.log(new Date(makeDate).toLocaleString('en-GB', { month: 'short', year: 'numeric' }), "makeDate.setMonth(makeDate.getMonth() - i)",i)
    // makeDate = makeDate.length > 8 ? makeDate.substring(0, 3) + "-" + makeDate.substring(7, 9) : makeDate.substring(0, 3) + "-" + makeDate.substring(6, 8)
    // console.log(makeDate, "makeDate")
    arr.push(makeDate);
  }
  return arr;
};

const createDynamicMonthRange = async (length, date) => {
  let arr = [];
  for (let i = 0; i <= length; i++) {
    var makeDate = new Date(date || '');
    makeDate = moment(new Date(date)).add(i, 'M').format('MMM-YY');
    // makeDate.setMonth(makeDate.getMonth() + i);
    // makeDate = new Date(makeDate).toLocaleString('en-GB', { month: 'short', year: 'numeric' })
    // makeDate = makeDate.length > 8 ? makeDate.substring(0, 3) + "-" + makeDate.substring(7, 9) : makeDate.substring(0, 3) + "-" + makeDate.substring(6, 8)
    // console.log(makeDate,"makeDate")
    arr.push(makeDate);
  }
  return arr;
};

const validatePerfiosResult = async (
  perfiosResult,
  index,
  perfiosAccountNo,
  xnsStartDate,
  xnsEndDate
) => {
  try {
    let perfiosData;
    let perfiosDataArr = [];
    if (perfiosResult['PIR:Data']?.['Statementdetails']) {
      if (Array.isArray(perfiosResult['PIR:Data']['Statementdetails'][0]['Statement'])) {
        for (
          let i = 0;
          i < perfiosResult['PIR:Data']['Statementdetails'][0]['Statement'].length;
          i++
        ) {
          let startDate =
            perfiosResult['PIR:Data']['Statementdetails'][0]['Statement'][i][
            'StatementAccounts'
            ][0]['StatementAccount'][0]['$']['xnsStartDate'];
          if (
            perfiosAccountNo ===
            perfiosResult['PIR:Data']['Statementdetails'][0]['Statement'][i][
            'StatementAccounts'
            ][0]['StatementAccount'][0]['$']['accountNo']
            // && Date.parse(new Date(startDate)) >= Date.parse(new Date(xnsStartDate))
            // && Date.parse(new Date(startDate)) <= Date.parse(new Date(xnsEndDate))
          ) {
            let data1 =
              perfiosResult['PIR:Data']?.['Statementdetails']?.[0]?.['Statement']?.[i]?.['$']?.[
              'statementStatus'
              ] || 'VERIFIED';

            perfiosDataArr.push(data1);
            perfiosData = perfiosDataArr;
            console.log(perfiosDataArr, 'perfiosDataArr');
            // return data1
            if (perfiosDataArr.includes('FRAUD')) {
              return 'FRAUD';
            } else if (perfiosDataArr.includes('REFER')) {
              return 'REFER';
            }
          }
        }
        return perfiosDataArr.includes('NA') ? 'NA' : 'VERIFIED'; // Returning true because no REFER or FRAUD was identified
      } else {
        perfiosData =
          perfiosResult?.['PIR:Data']?.['Statementdetails']?.['Statement']?.['$']?.[
          'statementStatus'
          ] || 'VERIFIED';

        if (perfiosData === 'FRAUD') {
          return 'FRAUD';
        } else if (perfiosData === 'REFER') {
          return 'REFER';
        } else if (perfiosData === 'VERIFIED') {
          console.log('Fraud identified in the perfios result');
          return 'VERIFIED';
        }
      }
    } else if (perfiosResult['PIR:Data']?.['Statementdetails']) {
      perfiosData =
        perfiosResult?.['PIR:Data']?.['Statementdetails']?.['Statement']?.['$']?.[
        'statementStatus'
        ] || 'VERIFIED';
      console.log(perfiosData, 'perfiosDataResult');
      return perfiosData;
    } else {
      return [];
    }
    console.log(perfiosData, 'perfiosData');
  } catch (error) {
    console.log(error, 'error');
    return [];
  }
};
const maxUtilization = async (data, index) => {
  try {
    let count = 0;
    let maxUtilizationData = data[0]?.[`MonthlyDetail` + (index + 1)][0]?.['Detail'];
    // console.log(maxUtilizationData, "maxUtilizationData")
    for (let i = 0; i < maxUtilizationData.length; i++) {
      count += Number(maxUtilizationData[i]['$']['maximumUtilization']);
      // console.log("Count", i, count)
    }
    return count.toString();
  } catch (error) {
    console.log(error, 'error in max utilization');
    return false;
  }
};

const minUtilization = async (data, index) => {
  try {
    let count = 0;
    let minimumUtilizationData = data[0]?.[`MonthlyDetail` + (index + 1)][0]?.['Detail'];
    // console.log(minimumUtilizationData, "minimumUtilizationData")
    for (let i = 0; i < minimumUtilizationData.length; i++) {
      count += Number(minimumUtilizationData[i]['$']['minimumUtilization']);
      // console.log("Count", i, count)
    }
    return count.toString();
  } catch (error) {
    console.log(error, 'error in min utilization');
    return false;
  }
};

const avgUtilization = async (data, index, monthRangeCount) => {
  try {
    let count = 0;
    let minimumUtilizationData = data[0]?.[`MonthlyDetail` + (index + 1)][0]?.['Detail'];
    // console.log(minimumUtilizationData, "minimumUtilizationData")
    for (let i = 0; i < minimumUtilizationData.length; i++) {
      count += Number(minimumUtilizationData[i]['$']['averageUtilization']);
      // console.log("Count", i, count)
    }
    if (count > 0) {
      count = count / monthRangeCount.length;
      console.log(count, monthRangeCount.length);
      return count.toFixed(2).toString();
    } else {
      return '0';
    }
  } catch (error) {
    console.log(error, 'error in min utilization');
    return false;
  }
};

const applicantzeroCredit = async (perfiosResult) => {
  let monthlyDetailsSegment;
  let monthlyDetailArrr = [];
  if (perfiosResult['PIR:Data'].hasOwnProperty('AccountAnalysis')) {
    if (Array.isArray(perfiosResult['PIR:Data']['AccountAnalysis'])) {
      for (let i = 0; i < perfiosResult['PIR:Data']['AccountAnalysis'].length; i++) {
        let data1 = perfiosResult['PIR:Data']['AccountAnalysis'][i];
        for (let j = 0; j < data1['MonthlyDetails'][0]['MonthlyDetail'].length; j++) {
          monthlyDetailArrr.push(
            perfiosResult['PIR:Data']['AccountAnalysis'][i]['MonthlyDetails'][0]['MonthlyDetail'][j]
          );
        }
      }
      monthlyDetailsSegment = monthlyDetailArrr;
    } else {
      monthlyDetailsSegment =
        perfiosResult['PIR:Data']['AccountAnalysis']['MonthlyDetails']['MonthlyDetail'];
    }
  } else {
    monthlyDetailsSegment = perfiosResult['PIR:Data']['MonthlyDetails'][0]['MonthlyDetail'];
  }
  let isZeroCredit = 0;
  let monthCountArr = [];
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (
      true
      // msBetweenDates <= numberOfCreditMonth // Inward Cheque bounces month to be changed
    ) {
      // console.log(i, msBetweenDates);
      // if (
      //   Number(monthlyDetailsSegment[i]["$"]["credits"]) > 0 ||
      //   Number(monthlyDetailsSegment[i]["$"]["debits"]) > 0
      // ) {
      //   isZeroCredit = isZeroCredit + 1;
      // }
      if (
        !monthCountArr.includes(monthlyDetailsSegment[i]['$']['monthName']) &&
        Number(monthlyDetailsSegment[i]['$']['credits']) <= 0
      ) {
        monthCountArr.push(monthlyDetailsSegment[i]['$']['monthName']);
      }
    }
  }
  // console.log(monthCountArr, "monthCountArr1");
  // console.log("isZeroCredit:", isZeroCredit);
  return monthCountArr?.length > 0 ? true : false;
};

// Scanned pdf -- new xml

const applicantzeroCredit1 = async (perfiosResult) => {
  let monthlyDetailsSegment;
  let monthlyDetailArrr = [];
  // if (perfiosResult["PIR:Data"].hasOwnProperty("AccountAnalysis")) {
  //     if (Array.isArray(perfiosResult["PIR:Data"]["AccountAnalysis"])) {
  //         for (
  //             let i = 0;
  //             i < perfiosResult["PIR:Data"]["AccountAnalysis"].length;
  //             i++
  //         ) {
  //             let data1 = perfiosResult["PIR:Data"]["AccountAnalysis"][i];
  //             for (
  //                 let j = 0;
  //                 j < data1["MonthlyDetails"][0]["MonthlyDetail"].length;
  //                 j++
  //             ) {
  //                 monthlyDetailArrr.push(
  //                     perfiosResult["PIR:Data"]["AccountAnalysis"][i]["MonthlyDetails"][0][
  //                     "MonthlyDetail"
  //                     ][j],
  //                 );
  //             }
  //         }
  //         monthlyDetailsSegment = monthlyDetailArrr;
  //     } else {
  //         monthlyDetailsSegment =
  //             perfiosResult["PIR:Data"]["AccountAnalysis"]["MonthlyDetails"][
  //             "MonthlyDetail"
  //             ];
  //     }
  // } else {
  monthlyDetailsSegment = perfiosResult['PIR:Data']['MonthlyDetails'][0]['MonthlyDetail'];
  // }
  let isZeroCredit = 0;
  let monthCountArr = [];
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    const now = new Date();
    const then = new Date(monthlyDetailsSegment[i]['$']['startDate']);
    var msBetweenDates =
      now.getMonth() - then.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // console.log(msBetweenDates);
    if (
      true
      // msBetweenDates <= numberOfCreditMonth // Inward Cheque bounces month to be changed
    ) {
      // console.log(i, msBetweenDates);
      // if (
      //   Number(monthlyDetailsSegment[i]["$"]["credits"]) > 0 ||
      //   Number(monthlyDetailsSegment[i]["$"]["debits"]) > 0
      // ) {
      //   isZeroCredit = isZeroCredit + 1;
      // }
      if (
        !monthCountArr.includes(monthlyDetailsSegment[i]['$']['monthName']) &&
        Number(monthlyDetailsSegment[i]['$']['credits']) <= 0
      ) {
        monthCountArr.push(monthlyDetailsSegment[i]['$']['monthName']);
      }
    }
  }
  console.log(monthCountArr, 'monthCountArr1');
  // console.log("isZeroCredit:", isZeroCredit);
  return monthCountArr?.length > 0 ? true : false;
};

const getConsolidatedData = async (perfiosResult, additionMonthlyDetails, index, monthDetails) => {
  let monthlyDetailsSegment;
  let arr = [],
    monthlyDetailArrr = [];
  // if (perfiosResult["PIR:Data"].hasOwnProperty("AccountAnalysis")) {
  //     if (Array.isArray(perfiosResult["PIR:Data"]["AccountAnalysis"])) {
  //         for (
  //             let i = 0;
  //             i < perfiosResult["PIR:Data"]["AccountAnalysis"].length;
  //             i++
  //         ) {
  //             let data1 = perfiosResult["PIR:Data"]["AccountAnalysis"][i];
  //             for (
  //                 let j = 0;
  //                 j < data1["MonthlyDetails"][0]["MonthlyDetail"].length;
  //                 j++
  //             ) {
  //                 monthlyDetailArrr.push(
  //                     perfiosResult["PIR:Data"]["AccountAnalysis"][i]["MonthlyDetails"][0][
  //                     "MonthlyDetail"
  //                     ][j],
  //                 );
  //             }
  //         }
  //         monthlyDetailsSegment = monthlyDetailArrr;
  //     } else {
  //         monthlyDetailsSegment =
  //             perfiosResult["PIR:Data"]["AccountAnalysis"]["MonthlyDetails"][
  //             "MonthlyDetail"
  //             ];
  //     }
  // } else {
  monthlyDetailsSegment = perfiosResult[0]['MonthlyDetail'];
  let additionalMonthlyDetailsSegment =
    additionMonthlyDetails[0][`MonthlyDetail` + (index + 1)][0]['Detail'];
  // }

  // console.log(additionalMonthlyDetailsSegment, "monthlyDetailsSegment")
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    let obj = {};
    if (
      Number(monthlyDetailsSegment[i]['$']['xnsCount']) > 0 ||
      monthDetails.finalMonthRange.includes(monthlyDetailsSegment[i]['$']['monthName'])
    ) {
      obj['monthYear'] = monthlyDetailsSegment[i]['$']['monthName'];
      obj['balAvg'] = monthlyDetailsSegment[i]['$']['balAvg'];
      obj['debitsCount'] = additionalMonthlyDetailsSegment[i]['$']['debits'];
      obj['debitsSum'] = additionalMonthlyDetailsSegment[i]['$']['totalDebit'];
      obj['creditsCount'] = additionalMonthlyDetailsSegment[i]['$']['credits'];
      obj['creditsSum'] = additionalMonthlyDetailsSegment[i]['$']['totalCredit'];
      obj['inwChqCount'] = monthlyDetailsSegment[i]['$']['inwBounces'];
      obj['outwChqCount'] = monthlyDetailsSegment[i]['$']['outwBounces'];
      obj['dpLimit'] = monthlyDetailsSegment[i]['$']['dpLimit'];
      obj['snLimit'] = monthlyDetailsSegment[i]['$']['snLimit'];
      obj['totalEmiLoanAmount'] = monthlyDetailsSegment[i]['$']['totalEmiOrLoan'];
      obj['totalEmiLoanCount'] = monthlyDetailsSegment[i]['$']['emiOrLoans'];
      obj['emiBounces'] = monthlyDetailsSegment[i]['$']['inwEMIBounces'];
      obj['xnsCount'] = monthlyDetailsSegment[i]['$']['xnsCount'];
      obj['overdrawnDays'] = monthlyDetailsSegment[i]['$']['overdrawnDays'];
      obj['penalCharges'] = monthlyDetailsSegment[i]['$']['penalCharges'];
      obj['intPayDelay'] = monthlyDetailsSegment[i]['$']['intPayDelay'];
      obj['avgUtilization'] = additionalMonthlyDetailsSegment[i]['$']['averageUtilization'];
      obj['maximumUtilization'] = additionalMonthlyDetailsSegment[i]['$']['maximumUtilization'];
      obj['minimumUtilization'] = additionalMonthlyDetailsSegment[i]['$']['minimumUtilization'];
      obj['avgNegEOD'] = monthlyDetailsSegment[i]['$']['avgNegEOD'] || 0;
      obj['balMinNeg'] = monthlyDetailsSegment[i]['$']['balMinNeg'] || 0;
      obj['balMin'] = monthlyDetailsSegment[i]['$']['balMin'] || 0;
      arr.push(obj);
    }
  }
  // console.log(arr)
  return arr;
};
async function getMonthDifference(givenDate) {
  // Convert the given date string to a Date object
  // console.log(givenDate, "givenDate")
  const [month, year] = givenDate.split('-');
  const givenDateObj = new Date(`${month}-01-${year}`);

  // Current date
  const currentDate = new Date();

  // Calculate the month difference
  const monthDiff =
    (currentDate.getFullYear() - givenDateObj.getFullYear()) * 12 +
    currentDate.getMonth() -
    givenDateObj.getMonth();

  return monthDiff;
}

const getBounces = async (perfiosResult, startMonth, endMonth) => {
  let monthlyDetailsSegment;
  let arr = [],
    monthlyDetailArrr = [],
    bouncesCount = 0;
  monthlyDetailsSegment = perfiosResult[0]['MonthlyDetail'];
  // console.log(monthlyDetailsSegment, "monthlyDetailsSegment")
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    let resp = await getMonthDifference(monthlyDetailsSegment[i]['$']['monthName']);
    if (
      resp >= startMonth &&
      resp <= endMonth &&
      Number(monthlyDetailsSegment[i]['$']['inwEMIBounces']) >= 1
    ) {
      bouncesCount += 1;
      console.log(
        `Month difference between ${monthlyDetailsSegment[i]['$']['monthName']} and the current date: ${resp} months`
      );
    }
  }
  return bouncesCount;
};

const getAbb = async (perfiosResult, startMonth, endMonth) => {
  let monthlyDetailsSegment;
  let arr = [],
    monthlyDetailArrr = [],
    bouncesCount = 0;
  monthlyDetailsSegment = perfiosResult[0]['MonthlyDetail'];
  // console.log(monthlyDetailsSegment, "monthlyDetailsSegment")
  for (let i = 0; i < monthlyDetailsSegment.length; i++) {
    let resp = await getMonthDifference(monthlyDetailsSegment[i]['$']['monthName']);
    if (
      resp >= startMonth &&
      resp <= endMonth &&
      Number(monthlyDetailsSegment[i]['$']['inwEMIBounces']) >= 1
    ) {
      bouncesCount += 1;
      console.log(
        `Month difference between ${monthlyDetailsSegment[i]['$']['monthName']} and the current date: ${resp} months`
      );
    }
  }
  return bouncesCount;
};

const getBankName = async (accNo, statementDetails) => {
  let iteStatment = statementDetails[0]['Statement'];
  for (let i = 0; i < iteStatment.length; i++) {
    // console.log(iteStatment[i], "statementDetails")
    if (iteStatment[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['accountNo'] === accNo) {
      // console.log(iteStatment[i]["StatementAccounts"][0]["StatementAccount"][0]["$"]["accountNo"], accNo, "shb")
      return iteStatment[i]['CustomerInfo']?.[0]['$']?.['bank'];
    }
  }
};

const getAccHolderName = async (accNo, statementDetails) => {
  let iteStatment = statementDetails[0]['Statement'];
  for (let i = 0; i < iteStatment.length; i++) {
    // console.log(iteStatment[i], "statementDetails")
    if (iteStatment[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['accountNo'] === accNo) {
      // console.log(iteStatment[i]["StatementAccounts"][0]["StatementAccount"][0]["$"]["accountNo"], accNo, "shb")
      return iteStatment[i]['CustomerInfo']?.[0]['$']?.['name'];
    }
  }
};

const getTxnStartDt = async (accNo, statementDetails) => {
  // console.log(statementDetails, "statementDetails")
  let iteStatment = statementDetails[0]['Statement'];
  for (let i = 0; i < iteStatment.length; i++) {
    // console.log(iteStatment[i], "statementDetails")
    if (iteStatment[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['accountNo'] === accNo) {
      // console.log(iteStatment[i]["StatementAccounts"][0]["StatementAccount"][0]["$"]["accountNo"], accNo, "shb")
      return iteStatment[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsStartDate'];
    }
  }
};

const getTxnEndDt = async (accNo, statementDetails) => {
  let iteStatment = statementDetails[0]['Statement'];
  for (let i = 0; i < iteStatment.length; i++) {
    // console.log(iteStatment[i], "statementDetails")
    if (iteStatment[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['accountNo'] === accNo) {
      // console.log(iteStatment[i]["StatementAccounts"][0]["StatementAccount"][0]["$"]["accountNo"], accNo, "shb")
      return iteStatment[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsEndDate'];
    }
  }
};

const avgBankBalance = async (perfiosResult, startDate, endDate, dataHeader) => {
  let avgBankBalanceData;
  let avgBankBalanceSum = 0;
  let avgBankBalanceCount = 0;
  let monthlyDetailArrr = [];
  // console.log(perfiosResult["MonthlyDetails"], "ksfjbvh")

  let data1 = perfiosResult;
  for (let j = 0; j < data1['MonthlyDetails'][0]['MonthlyDetail'].length; j++) {
    monthlyDetailArrr.push(data1['MonthlyDetails'][0]['MonthlyDetail'][j]);
  }
  avgBankBalanceData = monthlyDetailArrr;

  // console.log(avgBankBalanceData,"avgBankBalanceData")
  for (let i = 0; i < avgBankBalanceData.length; i++) {
    const lastDt = new Date(endDate),
      firstDt = new Date(startDate);
    const now = new Date();
    const then = new Date(startDate);

    // let startDtFun = now.getMonth() - firstDt.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // let endDtFun = now.getMonth() - lastDt.getMonth() + 12 * (now.getFullYear() - then.getFullYear());
    // let monthDiff = await getMonthDifference(avgBankBalanceData[i]["$"]["monthName"])
    // console.log(startDtFun, "startDtFun", endDtFun, "endDtFun", monthDiff, "monthDiff")
    // var msBetweenDates =
    //     now.getMonth() -
    //     then.getMonth() +
    //     12 * (now.getFullYear() - then.getFullYear());
    console.log(Number(avgBankBalanceData[i]['$']['xnsCount']), i, 'msBetweenDates');
    if (Number(avgBankBalanceData[i]['$']['xnsCount']) > 0) {
      // console.log(msBetweenDates, "msBetweenDates")
      avgBankBalanceCount = avgBankBalanceCount + 1;
      avgBankBalanceSum = avgBankBalanceSum + Number(avgBankBalanceData[i]['$']['balAvg']);
    }
  }

  console.log(avgBankBalanceCount, avgBankBalanceSum, 'avgBankBalanceCount');
  if (dataHeader?.emp_type === 'SAL') {
    return Math.floor(avgBankBalanceSum / 3).toString();
  } else if (dataHeader?.abb_months) {
    return Math.floor(avgBankBalanceSum / dataHeader?.abb_months).toString();
  } else {
    return Math.floor(avgBankBalanceSum / 6).toString();
  }
};

const getXnsStartDate = async (perfiosAccountNo, xnsData) => {
  console.log(xnsData, 'xnsData');
  for (let i = 0; i < xnsData.length; i++) {
    if (xnsData[i]['$']['accountNo'] === perfiosAccountNo) {
      // console.log(xnsData[i]["Xn"])
      for (let j = 0; j < xnsData[i]['Xn'].length; j++) {
        return xnsData[i]['Xn'][j]['$']['date'];
      }
    }
  }
};

const getXnsEndDate = async (perfiosAccountNo, xnsData) => {
  let endDate = '';
  for (let i = 0; i < xnsData.length; i++) {
    if (xnsData[i]['$']['accountNo'] === perfiosAccountNo) {
      // console.log(xnsData[i]["Xn"])
      for (let j = 0; j < xnsData[i]['Xn'].length; j++) {
        endDate = xnsData[i]['Xn'][j]['$']['date'];
      }
    }
  }
  return endDate;
};

const getStatementDetails = async (accNo, stamentDetails) => {
  let statementList = [],
    statemenData = [];
  try {
    if (Array.isArray(stamentDetails[0]['Statement'])) {
      statemenData = stamentDetails[0]['Statement'];
    } else {
      statemenData = [stamentDetails[0]['Statement']];
    }
    // console.log(statemenData, "statemen full Data")
    for (let i = 0; i < statemenData.length; i++) {
      // console.log(statemenData[i], "stamentDetailsstamentDetails")
      if (
        accNo === statemenData[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['accountNo']
      ) {
        var obj = {};
        obj['statementname'] = statemenData[i]['$']['fileName'];
        obj['statementStatus'] = statemenData?.[i]?.['$']?.['statementStatus'] || 'VERIFIED';
        obj['email'] = statemenData[i]['CustomerInfo'][0]['$']['email'];
        obj['mobile'] = statemenData[i]['CustomerInfo'][0]['$']['mobile'];
        obj['pan'] = statemenData[i]['CustomerInfo'][0]['$']['pan'];
        obj['address'] = statemenData[i]['CustomerInfo'][0]['$']['address'];
        obj['reason'] = statemenData[i]['$']['reason'];
        obj['xnsStartDate'] =
          statemenData[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsStartDate'];
        obj['xnsEndDate'] =
          statemenData[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['xnsEndDate'];
        obj['accountNo'] =
          statemenData[i]['StatementAccounts'][0]['StatementAccount'][0]['$']['accountNo'];
        statementList.push(obj);
      }
    }
    return statementList;
  } catch (error) {
    console.log(error, 'Error in getStatementDetails');
    return statementList;
  }
};

const checkStatementType = async (data) => {
  console.log('data', data);
  switch (data) {
    case 'NetBanking Account':
      return 'NetBanking';
    case 'Uploaded Statements':
      return 'EPDF';
    case 'Account Aggregator':
      return 'AA';
    default:
      return '';
  }
};

export const perfiosProcess = async (actualperfiosResult, type = 'perfiosonline', dataHeader) => {
  try {
    let perfiosResult = await modifiedperfiosResult(
      actualperfiosResult,
      dataHeader?.abb_months || 6
    );
    // let perfiosResult = await readFile(requestData?.xmlData)
    // console.log(JSON.stringify(perfiosResult), type, "Perfios Result")
    if (type === 'perfiosonline')
      if (perfiosResult) {
        if (!Array.isArray(perfiosResult['PIR:Data']['AccountAnalysis'])) {
          perfiosResult['PIR:Data']['AccountAnalysis'] = [
            perfiosResult['PIR:Data']['AccountAnalysis'],
          ];
        }
        let splitBankingresponseArr = [];
        if (
          perfiosResult['PIR:Data']?.['AccountAnalysis'] &&
          Array.isArray(perfiosResult['PIR:Data']['AccountAnalysis'])
        ) {
          for (let j = 0; j < perfiosResult['PIR:Data']['AccountAnalysis'].length; j++) {
            // console.log(perfiosResult["PIR:Data"]["AccountAnalysis"][j], "Perfios result")
            let perfiosFilteredData =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['MonthlyDetails'][0][
              'MonthlyDetail'
              ],
              perfiosAccountNo = perfiosResult['PIR:Data']['AccountAnalysis'][j]['$']['accountNo'],
              xnsStartDate = await getTxnStartDt(
                perfiosAccountNo,
                perfiosResult['PIR:Data']['Statementdetails']
              ),
              xnsEndDate = await getTxnEndDt(
                perfiosAccountNo,
                perfiosResult['PIR:Data']['Statementdetails']
              );
            let obj = {};
            let monthDetails = await getMonthDetails(
              perfiosFilteredData,
              perfiosResult,
              perfiosAccountNo
            );
            let consolidatedData = await getConsolidatedData(
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['MonthlyDetails'],
              perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
              j,
              monthDetails
            ),
              rootTotalCredits = 0,
              rootCredits = 0,
              rootDebits = 0,
              rootTotalDebits = 0;
            consolidatedData.forEach((data) => {
              rootTotalCredits += Number(data.creditsSum);
            });
            consolidatedData.forEach((data) => {
              rootCredits += Number(data.creditsCount);
            });
            consolidatedData.forEach((data) => {
              rootDebits += Number(data.debitsCount);
            });
            consolidatedData.forEach((data) => {
              rootTotalDebits += Number(data.debitsSum);
            });
            obj['bankName'] = perfiosResult['PIR:Data']?.['Statementdetails']
              ? await getBankName(perfiosAccountNo, perfiosResult['PIR:Data']?.['Statementdetails'])
              : perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['$']['instName'];
            obj['accNo'] = perfiosAccountNo;
            obj['customerTransactionId'] = perfiosResult['PIR:Data']?.['CustomerInfo']
              ? perfiosResult['PIR:Data']['CustomerInfo'][0]['$']?.['customerTransactionId']
              : '';
            obj['primaryHolder'] = perfiosResult['PIR:Data']?.['Statementdetails']
              ? await getAccHolderName(
                perfiosAccountNo,
                perfiosResult['PIR:Data']['Statementdetails']
              )
              : perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['$']['name'];
            obj['accType'] = perfiosResult['PIR:Data']['AccountAnalysis'][j]['$']['accountType'];
            // obj["xnsStartDate"] = await getXnsStartDate(perfiosAccountNo, perfiosResult["PIR:Data"]["Xns"])
            // obj["xnsEndDate"] = await getXnsEndDate(perfiosAccountNo, perfiosResult["PIR:Data"]["Xns"])
            obj['xnsStartDate'] = monthDetails.startDate;
            obj['xnsEndDate'] = monthDetails.endDate;
            obj['sanctionLimit'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Average'][0]['$'][
              'snLimit'
              ]; //monthlydetails
            obj['emiServiced'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Average'][0]['$'][
              'totalEmiOrLoan'
              ]; //monthlydetails
            obj['statementStatus'] = await validatePerfiosResult(
              perfiosResult,
              j,
              perfiosAccountNo,
              monthDetails.startDate,
              monthDetails.endDate
            );
            obj['statementType'] = await checkStatementType(
              perfiosResult['PIR:Data']['AdditionalSummaryInfo'][0]['SummaryInfo1'][0]['$'][
              'source'
              ]
            );
            obj['averageSalaries'] = await minIncome_2(perfiosFilteredData, 'SALARIED');
            obj['averageBankBalance'] = await avgBankBalance(
              perfiosResult['PIR:Data']['AccountAnalysis'][j],
              xnsStartDate,
              xnsEndDate,
              dataHeader
            );
            obj['FCUstatus'] = perfiosResult['PIR:Data']['AccountAnalysis'][j]['FCUAnalysis']
              ? perfiosResult['PIR:Data']['AccountAnalysis'][j]['FCUAnalysis']
              : '';
            obj['monthYear'] = monthDetails.finalMonthRange;
            obj['annualbankingcredits'] = await annualbankingcredits_2(
              perfiosFilteredData,
              dataHeader
            );
            obj['inwardBounceCount'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'inwBounces'
              ];
            obj['inwardChqBounceCount'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'inwChqBounces'
              ];
            obj['outwardBounceCount'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'outwBounces'
              ];
            obj['outwardChqBounceCount'] = perfiosResult['PIR:Data']['AccountAnalysis'][0][
              'SummaryInfo'
            ][0]['Total'][0]['$']['outwChqBounces']
              ? perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
              'outwChqBounces'
              ]
              : '';
            obj['totalCredits'] = rootTotalCredits.toString();
            obj['totalDebits'] = rootTotalDebits.toString();
            obj['countDebits'] = rootDebits.toString();
            obj['countCredits'] = rootCredits.toString();
            obj['totalEmi'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'totalEmiOrLoan'
              ];
            obj['countEmi'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'emiOrLoans'
              ];
            obj['inwEmiBouncesCount6M'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'inwEMIBounces'
              ];
            obj['drawingPower'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'dpLimit'
              ];
            obj['overDrawnDays'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'overdrawnDays'
              ];
            obj['penalCharges'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'penalCharges'
              ];
            obj['intrestServiceDelay'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'intPayDelay'
              ];
            obj['chqDepositsCount'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'chqDeposits'
              ];
            obj['chqIssuesCount'] =
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
              'chqIssues'
              ];
            obj['maxUtilization'] = await maxUtilization(
              perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
              j
            );
            obj['minUtilization'] = await minUtilization(
              perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
              j
            );
            obj['avgUtilization'] = await avgUtilization(
              perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
              j,
              monthDetails.finalMonthRange
            );
            obj['applicantzeroCredit'] = await applicantzeroCredit(perfiosResult);
            obj['bounces_0m_3m'] = await getBounces(
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['MonthlyDetails'],
              0,
              3
            );
            obj['bounces_4m_6m'] = await getBounces(
              perfiosResult['PIR:Data']['AccountAnalysis'][j]['MonthlyDetails'],
              4,
              6
            );
            obj['consolidateData'] = consolidatedData;
            obj['ifsc'] = perfiosResult['PIR:Data']?.['Xns']?.[j]?.['$']?.['ifscCode'] || 'NA';
            obj['micrCode'] = perfiosResult['PIR:Data']?.['Xns']?.[j]?.['$']?.['micrCode'] || 'NA';
            obj['statements'] = await getStatementDetails(
              perfiosAccountNo,
              perfiosResult['PIR:Data']['Statementdetails']
            );
            splitBankingresponseArr.push(obj);
          }
        } else {
          console.log(typeof perfiosResult['PIR:Data']['AccountAnalysis']);
          let perfiosFilteredData =
            perfiosResult['PIR:Data']['AccountAnalysis']['MonthlyDetails'][0]['MonthlyDetail'];
          let obj = {};
          let monthDetails = await getMonthDetails(
            perfiosFilteredData,
            perfiosResult,
            perfiosAccountNo
          );
          let consolidatedData = await getConsolidatedData(
            perfiosResult['PIR:Data']['AccountAnalysis'][j]['MonthlyDetails'],
            perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
            j,
            monthDetails
          ),
            rootTotalCredits = 0,
            rootCredits = 0;
          consolidatedData.forEach((data) => {
            rootTotalCredits += Number(data.creditsSum);
          });
          consolidatedData.forEach((data) => {
            rootCredits += Number(data.creditsCount);
          });
          obj['customerTransactionId'] = perfiosResult['PIR:Data']?.['CustomerInfo']
            ? perfiosResult['PIR:Data']['CustomerInfo'][0]['$']?.['customerTransactionId']
            : '';
          obj['primaryHolder'] = perfiosResult['PIR:Data']?.['Statementdetails']
            ? perfiosResult['PIR:Data']['Statementdetails']?.[0]['Statement']?.['CustomerInfo']?.[
            '$'
            ]?.['name']
            : perfiosResult['PIR:Data']['CustomerInfo']?.[0]['$']?.['name'];
          obj['accType'] = perfiosResult['PIR:Data']['AccountAnalysis'][0]['$']['accountType'];
          obj['accNo'] = perfiosResult['PIR:Data']['AccountAnalysis'][0]['$']['accountNo'];
          obj['sanctionLimit'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][0][
            'snLimit'
            ];
          obj['emiServiced'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][0][
            'totalEmiOrLoan'
            ];
          obj['statementStatus'] = await validatePerfiosResult(perfiosResult, 0);
          obj['averageSalaries'] = await minIncome_2(perfiosFilteredData, 'SALARIED');
          obj['averageBankBalance'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'balAvg'
            ];
          obj['FCUstatus'] = perfiosResult['PIR:Data']['AccountAnalysis'][0]?.['FCUAnalysis']
            ? perfiosResult['PIR:Data']['AccountAnalysis'][0]?.['FCUAnalysis']
            : '';
          obj['xnsStartDate'] = monthDetails.startDate;
          obj['xnsEndDate'] = monthDetails.endDate;
          obj['monthYear'] = monthDetails.finalMonthRange;
          obj['annualbankingcredits'] = await annualbankingcredits_2(
            perfiosFilteredData,
            dataHeader
          );
          obj['inwardBounceCount'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'inwBounces'
            ];
          obj['inwardChqBounceCount'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'inwChqBounces'
            ];
          obj['outwardBounceCount'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'outwBounces'
            ];
          obj['outwardChqBounceCount'] = perfiosResult['PIR:Data']['AccountAnalysis'][0][
            'SummaryInfo'
          ][0]['Total'][0]['$']['outwChqBounces']
            ? perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'outwChqBounces'
            ]
            : '';
          obj['totalCredits'] = rootTotalCredits.toString();
          obj['totalDebits'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'totalCredit'
            ];
          obj['countDebits'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'debits'
            ];
          obj['countCredits'] = rootCredits.toString();
          obj['totalEmi'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'totalEmiOrLoan'
            ];
          obj['countEmi'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'][
            'emiOrLoans'
            ];
          obj['inwEmiBouncesCount6M'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'inwEMIBounces'
            ];
          obj['drawingPower'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'dpLimit'
            ];
          obj['overDrawnDays'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'overdrawnDays'
            ];
          obj['penalCharges'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'penalCharges'
            ];
          obj['intrestServiceDelay'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'intPayDelay'
            ];
          obj['chqDepositsCount'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'chqDeposits'
            ];
          obj['chqIssuesCount'] =
            perfiosResult['PIR:Data']['AccountAnalysis'][0]['SummaryInfo'][0]['Total'][0]['$'][
            'chqIssues'
            ];
          obj['maxUtilization'] = await maxUtilization(
            perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
            0
          );
          obj['minUtilization'] = await minUtilization(
            perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
            0
          );
          obj['avgUtilization'] = await avgUtilization(
            perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
            0,
            monthDetails.finalMonthRange
          );
          obj['applicantzeroCredit'] = await applicantzeroCredit(perfiosResult);
          obj['bounces_0m_3m'] = await getBounces(perfiosFilteredData, 0, 3);
          obj['bounces_4m_6m'] = await getBounces(perfiosFilteredData, 4, 6);
          obj['consolidateData'] = consolidatedData;
          obj['ifsc'] = perfiosResult['PIR:Data']?.['Xns']?.[j]?.['$']?.['ifscCode'] || 'NA';
          obj['micrCode'] = perfiosResult['PIR:Data']?.['Xns']?.[j]?.['$']?.['micrCode'] || 'NA';
          obj['statements'] = await getStatementDetails(
            perfiosAccountNo,
            perfiosResult['PIR:Data']['Statementdetails']
          );
          splitBankingresponseArr.push(obj);
        }
        const now = new Date(),
          fileName = now.getTime() + '.json';
        fs.writeFileSync(`temp/${fileName}`, JSON.stringify(perfiosResult), 'utf-8');
        let req = {
          file: {
            fileName,
            path: `temp/${fileName}`,
          },
        };
        let dmsResponse = await new DmsService().uploadDocument(req, fileName);
        fs.unlink(`temp/${fileName}`, (err) => {
          if (err) {
            console.error(`Error deleting ${fileName}:`, err.message);
          } else {
            console.log(`${fileName} deleted`);
          }
        });
        console.log(dmsResponse, 'DMS response');
        return {
          status: true,
          data: splitBankingresponseArr,
          dms_id: dmsResponse.data,
        };
      } else {
        return { status: false, Message: 'Error in reading the xml data' };
      }
    else if (type === 'scannedbanking')
      if (perfiosResult) {
        // SB - ScannedBanking
        console.log(perfiosResult['PIR:Data'], 'Perfios result');
        let splitBankingresponseArr = [];
        console.log(typeof perfiosResult['PIR:Data']);
        let perfiosFilteredData =
          perfiosResult?.['PIR:Data']['AccountAnalysis']?.['MonthlyDetails']?.[0][
          'MonthlyDetail'
          ] || perfiosResult?.['PIR:Data']?.['MonthlyDetails']?.[0]?.['MonthlyDetail'];
        let obj = {};
        let monthDetails = await getMonthDetails(
          perfiosFilteredData,
          perfiosResult,
          perfiosAccountNo
        );
        let consolidatedData = await getConsolidatedData(
          perfiosResult['PIR:Data']['AccountAnalysis'][j]['MonthlyDetails'],
          perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
          j,
          monthDetails
        ),
          rootTotalCredits = 0,
          rootCredits = 0;
        consolidatedData.forEach((data) => {
          rootTotalCredits += Number(data.creditsSum);
        });
        consolidatedData.forEach((data) => {
          rootCredits += Number(data.creditsCount);
        });
        // console.log(perfiosResult["PIR:Data"]?.["SummaryInfo"]?.[0], "skdjbf")
        obj['primaryHolder'] = perfiosResult['PIR:Data']?.hasOwnProperty('Statementdetails')
          ? perfiosResult['PIR:Data']['Statementdetails']?.[0]['Statement'][0]?.[
          'CustomerInfo'
          ][0]?.['$']?.['name']
          : perfiosResult['PIR:Data']?.['StatementAccounts']?.[0]['$']?.['name'];
        obj['accType'] = perfiosResult['PIR:Data']?.['SummaryInfo']?.[0]['$']?.['accType'];
        obj['accNo'] = perfiosResult['PIR:Data']?.['SummaryInfo']?.[0]['$']?.['accNo'];
        obj['xnsStartDate'] = monthDetails.startDate;
        obj['xnsEndDate'] = monthDetails.endDate;
        // obj["sanctionLimit"] =
        //     perfiosResult["PIR:Data"]["SummaryInfo"][0]["Total"][0]["$"][0]["snLimit"];
        obj['emiServiced'] =
          perfiosResult['PIR:Data']?.['SummaryInfo']?.[0]['Total']?.[0]['$']?.['totalEmiOrLoan'];
        obj['statementStatus'] = await validatePerfiosResult(perfiosResult);
        obj['averageSalaries'] = await minIncome_2(perfiosFilteredData, 'SALARIED');
        obj['averageBankBalance'] =
          perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['balAvg'];
        obj['FCUstatus'] = perfiosResult['PIR:Data']?.['FCUAnalysis']
          ? perfiosResult['PIR:Data']?.['FCUAnalysis']
          : '';
        obj['monthYear'] = monthDetails.finalMonthRange;
        obj['annualbankingcredits'] = await annualbankingcredits_2(perfiosFilteredData, dataHeader);
        obj['inwardBounceCount'] =
          perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['inwBounces'];
        obj['inwardChqBounceCount'] = perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$'][
          'inwChqBounces'
        ]
          ? perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['inwChqBounces']
          : '';
        obj['outwardBounceCount'] =
          perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['outwBounces'];
        obj['outwardChqBounceCount'] = perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$'][
          'outwChqBounces'
        ]
          ? perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['outwChqBounces']
          : '';
        obj['totalCredits'] = rootTotalCredits.toString();
        obj['totalDebits'] =
          perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['totalDebit'];
        obj['countDebits'] = perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['debits'];
        obj['countCredits'] = rootCredits.toString();
        obj['totalEmi'] =
          perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['totalEmiOrLoan'];
        obj['countEmi'] =
          perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['emiOrLoans'];
        obj['inwEmiBouncesCount6M'] = perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$'][
          'inwEMIBounces'
        ]
          ? perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['inwEMIBounces']
          : '';
        obj['drawingPower'] = perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$'][
          'dpLimit'
        ]
          ? perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['dpLimit']
          : '';
        obj['overDrawnDays'] = perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$'][
          'overdrawnDays'
        ]
          ? perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['overdrawnDays']
          : '';
        obj['penalCharges'] = perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$'][
          'penalCharges'
        ]
          ? perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['penalCharges']
          : '';
        obj['intrestServiceDelay'] = perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$'][
          'intPayDelay'
        ]
          ? perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['intPayDelay']
          : '';
        obj['chqDepositsCount'] =
          perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['chqDeposits'];
        obj['chqIssuesCount'] =
          perfiosResult['PIR:Data']['SummaryInfo'][0]['Total'][0]['$']['chqIssues'];
        obj['maxUtilization'] = await maxUtilization(
          perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
          0
        );
        obj['minUtilization'] = await minUtilization(
          perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
          0
        );
        obj['avgUtilization'] = await avgUtilization(
          perfiosResult['PIR:Data']['AdditionalMonthlyDetails'],
          0,
          monthDetails.finalMonthRange
        );
        obj['applicantzeroCredit'] = await applicantzeroCredit1(perfiosResult);
        obj['consolidateData'] = consolidatedData;
        obj['ifsc'] = perfiosResult['PIR:Data']?.['Xns']?.[j]?.['$']?.['ifscCode'] || 'NA';
        obj['micrCode'] = perfiosResult['PIR:Data']?.['Xns']?.[j]?.['$']?.['micrCode'] || 'NA';
        splitBankingresponseArr.push(obj);
        const now = new Date(),
          fileName = now.getTime() + '.json';
        fs.writeFileSync(`temp/${fileName}`, JSON.stringify(perfiosResult), 'utf-8');
        let req = {
          file: {
            fileName,
            path: `temp/${fileName}`,
          },
        };
        let dmsResponse = await new DmsService().uploadDocument(req, fileName);
        fs.unlink(`temp/${fileName}`, (err) => {
          if (err) {
            console.error(`Error deleting ${fileName}:`, err.message);
          } else {
            console.log(`${fileName} deleted`);
          }
        });
        console.log(dmsResponse, 'DMS response');
        return {
          status: true,
          data: splitBankingresponseArr,
          dms_id: dmsResponse.data,
        };
      } else {
        return { status: false, Message: 'Error in reading the xml data' };
      }
    else return { status: false, Message: 'Invalid header type' };
  } catch (error) {
    console.log(error, 'Error in perfios computation');
    return { status: false, Message: 'Error in perfios computation' };
  }
};

const modifiedperfiosResult = async (perfiosData, avg = 6) => {
  try {
    let perfiosResult = perfiosData;
    let splitBankingresponseArr = [];
    const monthdata = await monthsplit(avg);
    const avgcount = avg;
    // let consdatedData = [];

    if (!Array.isArray(perfiosResult['PIR:Data']['AccountAnalysis'])) {
      perfiosResult['PIR:Data']['AccountAnalysis'] = [perfiosResult['PIR:Data']['AccountAnalysis']];
    }

    if (
      perfiosResult['PIR:Data']?.['AccountAnalysis'] &&
      Array.isArray(perfiosResult['PIR:Data']['AccountAnalysis'])
    ) {
      for (let j = 0; j < perfiosResult['PIR:Data']['AccountAnalysis'].length; j++) {
        let consdatedData = [];
        let account =
          perfiosResult['PIR:Data']['AccountAnalysis'][j]?.MonthlyDetails[0].MonthlyDetail;
        //let account=monthlyDet["MonthlyDetail"]
        account.forEach((element) => {
          if (monthdata.includes(element?.['$']?.['monthName'])) {
            console.log(element?.['$']?.['monthName'], 'DAta');
            consdatedData.push(element['$']);
          }
          console.log(consdatedData, 'last 6 month');
        });

        if (consdatedData.length > 0) {
          let copmutation = await calculateAverage(consdatedData, avgcount);
          console.log(copmutation.total, copmutation.averages, 'modresult');
          perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Average'][0]['$'] =
            copmutation.averages;
          perfiosResult['PIR:Data']['AccountAnalysis'][j]['SummaryInfo'][0]['Total'][0]['$'] =
            copmutation.total;
        }
        //account.total=result
        console.log(account, 'modifiedData');
      }
    }
    return perfiosResult;
  } catch (error) {
    console.log(error);
    throw new Error('Error in modifying Perfios Data');
  }
};

const monthsplit = async (data) => {
  const monthList = [];
  for (let i = 1; i <= data; i++) {
    const date = moment().subtract(i, 'months');
    const formatted = date.format('MMM-YY'); // "Dec-21"
    monthList.push(formatted);
  }
  return monthList;
};

const calculateAverage = async (perData, count) => {
  try {
    const normalized = perData.map((entry) => entry.$ || entry);
    // Get numeric keys
    const keys = Object.keys(normalized[0]).filter((key) => !isNaN(parseFloat(normalized[0][key])));
    // Initialize totals
    const totals = {};
    keys.forEach((key) => (totals[key] = 0));
    // Sum all values
    normalized.forEach((item) => {
      keys.forEach((key) => {
        totals[key] += parseFloat(item[key]);
      });
    });

    // Calculate averages
    // const count = normalized.length;
    const averages = {};
    const total = {};
    keys.forEach((key) => {
      total[key] = totals[key].toFixed(2);
      averages[key] = (totals[key] / count).toFixed(2);
    });

    return { total, averages };
  } catch (error) {
    console.log(error?.message || error);
    throw new Error('Error in Calculating  statement Average');
  }
};

export const readFile = async (perfiosResult) => {
  // console.log(data, "datahsdb");
  if (perfiosResult) {
    return new Promise((resolve, reject) => {
      const options = {
        explicitArray: false,
      };
      parseString(perfiosResult, options, function (err, result) {
        if (err) {
          console.log(err);
          reject(false);
        } else {
          if (result) {
            resolve(result);
            console.log(JSON.stringify(result), 'result');
            fs.writeFile('test.json', JSON.stringify(result), (err) => {
              if (err) console.log(err);
              else console.log('completed');
            });
          }
        }
      });
    });
  } else {
    return false;
  }
};

console.log(await perfiosProcess(await readFile(xmlResponse)))
console.log(await readFile(xmlResponse))
