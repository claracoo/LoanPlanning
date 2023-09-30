import './App.css';
import { useState, useEffect, Fragment } from 'react';

function App() {
  const [rows, setRows] = useState([
    {
    number: 1,
    color: "#34344A",
    disDate: "12/31/23",
    initBalance: 0,
    interestRate: 0,
    },
  ])
  const [months, setMonths] = useState([])
  const [colors, setColors] = useState([
    "#34344A",
    "#44633f",
    "#ffc6d9",
    "#E1D89F",
    "#9DF7E5",
    "#90BEDE",
    "#885053",
    "#000000",
    "#363946",
    "#2C666E"
  ])
  const [addRowDisabled, setAddRowDisabled] = useState(false)
  const [removeRowDisabled, setRemoveRowDisabled] = useState(true)

  useEffect(() => {
    fillInMonths()
  }, [])

  const updateMetaField = (event, field, index) => {
    let tempLoanData = [...rows]
    tempLoanData[index][field] = event.target.value
    setRows(tempLoanData)
    if (field == "initBalance" || field == "interestRate") {
      console.log(index)
      calcBalanceLeft(index, tempLoanData)
    }
  }

  const calcBalanceLeft = (index, data) => {
    let tempRowData = data
    let loan = tempRowData[index]
    if (loan.initBalance) {
      for (let i = 0; i < months.length; i++) {
        let prevMonthBalance = 0;
        let daysSinceLastPaid = 0;
        if (i == 0) {
          prevMonthBalance = loan.initBalance
          daysSinceLastPaid = 45;
        }
        else {
          prevMonthBalance = loan[months[i - 1]].balanceLeft
          daysSinceLastPaid = loan[months[i - 1]].daysInMonth
        }
        let newMonthBalance = (prevMonthBalance * Math.pow(1 + ((loan.interestRate / 100) / 365), daysSinceLastPaid)) - loan[months[i]].amount;
        loan[months[i]].balanceLeft = newMonthBalance.toFixed(2);
      }
      setRows(tempRowData)
    }
  }

  const fillInMonths = () => {
    let tempMonthData = [];
    let newDate = new Date()
    let day = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();

    if (day >= 15) {
      month++;
      if (month == 13) {
        month = 1
        year++;
      }
    }
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 12; j++) {
        let nextMonth = month + j;
        if (nextMonth > 12) nextMonth %= 12;
        tempMonthData.push(String(nextMonth) + "/" + String(year + i))
      }
    }
    setMonths(tempMonthData)

    let rowWithMonths = setupMonthsForRows(rows[0], tempMonthData);
    setRows([rowWithMonths])
  }

  const setupMonthsForRows = (row, monthData) => {
    let tempRowData = row;
    for (let month of monthData) {
      let days = daysInMonth(Number(month.split("/")[0]), Number(month.split("/")[1]));
      tempRowData[month] = {
        daysInMonth: days,
        amount: 0,
        time: 0,
        balanceLeft: row.initBalance,
      }
    }

    return tempRowData;
  }


  const daysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  }

  const monthsSetup = months.map((month) =>
    <th colSpan="3" className="header">{month}</th>
  );

  const monthHeaders = months.map((month) =>
    <Fragment>
        <th>Amount Paid</th>
        <th>How many months to pay this amount</th>
        <th>Balance Left</th>
    </Fragment>
  );

  const monthData = (loanNum) => {
    let loan = rows[loanNum - 1]
    return(
    months.map((month) => 
    <Fragment key={month}>
          <td>
            <input type="text" id="amtPaid" name="amtPaid" placeholder="0" />
          </td>
          <td>Until Paid Off</td>
          <td>{loan[month].balanceLeft}</td>
    </Fragment>
    ))};


  const listMetaDataRows = rows.map((row) =>
      <tr key={row.number}>
        <div className="metadata">
          <td className="loanNum">
            <button disabled={removeRowDisabled ? true : false} onClick={() => removeLoan(row.number - 1)}>x</button>
            <input disabled value={row.number} type="text" id="Name" name="Name" placeholder="Loan Name" />
          </td>
          <td className="loanColor">
            <input className="colorSwatch" disabled type="text" id="Color" name="Color" style={{backgroundColor: row.color}}/>
          </td>
          <td>
            <input onChange={event => updateMetaField(event, "disDate", row.number - 1)} value={row.disDate} type="text" id="Date" name="Date" placeholder="Loan Date" />
          </td>
          <td className="initBalance">
            <input onChange={event => updateMetaField(event, "initBalance", row.number - 1)} value={row.initBalance} type="text" id="Bal" name="Bal" placeholder="Initial Balance" />
          </td>
          <td className="initBalance">
            <input onChange={event => updateMetaField(event, "interestRate", row.number - 1)} value={row.interestRate} type="text" id="Rate" name="Rate" placeholder="Interest Rate" />
          </td>
        </div>
        {monthData(row.number)}
      </tr>
  );

  const addLoan = () => {
    if (rows.length == 9) {
      setAddRowDisabled(true);
    }
    setRemoveRowDisabled(false);

    let emptyLoan = {
      number: rows.length + 1,
      color: colors[rows.length],
      disDate: "12/31/23",
      initBalance: 0,
      interestRate: 0
    }
    emptyLoan = setupMonthsForRows(emptyLoan, months);
    let tempLoanData = [...rows];
    tempLoanData.push(emptyLoan);
    setRows(tempLoanData);
    
  }

  const removeLoan = index => {
    if (rows.length == 2) {
      setRemoveRowDisabled(true);
    }
    if (rows.length == 10) {
      setAddRowDisabled(false);
    }
    if (rows.length >= 2) {
      let tempLoanData = [...rows];
      tempLoanData.splice(index, 1)
      for (let i = index; i < tempLoanData.length; i++) {
        tempLoanData[i].number--;
        tempLoanData[i].color = colors[i];
      }
      setRows(tempLoanData);
    } 
  }


  return (
    <div className="App">
      <table className="loanMetaData">
        <tr>
          <th className="metadata header">Loans</th>
          {monthsSetup}
        </tr>
        <tr>
          <div className="metadata">
            <th className="loanNum">Loan Number</th>
            <th className="loanColor">Color</th>
            <th>Disbursement Date</th>
            <th className="initBalance">Initial Balance</th>
            <th className="initBalance">Interest Rate</th>
          </div>
          {monthHeaders}

        </tr>
        {listMetaDataRows}
        <tr>
          <td className="metadata">
            <button disabled={addRowDisabled ? true : false} onClick={addLoan}>+ Add Loan</button>
          </td>
        </tr>
      </table>
    </div>
  );
}

export default App;