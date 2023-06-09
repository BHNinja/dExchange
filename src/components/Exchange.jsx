import React, { useState, useEffect } from 'react'
import styles from '../style';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { CURRENCY } from '../tool/USDPKR';
import axios from 'axios';

let over_amount = 0;
let USDPKR = 0;

axios.get('http://localhost:3000/exchangerate')
.then(response => {
  console.log(response.data);
  USDPKR = response.data;
}).catch(err => {
  console.log("Unable");
});

const Exchange = () => {

  const [Show, setShow] = useState(false);
  const [Success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderId, setorderId] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('');

  const [initialValue, setinitialValue] = useState(0);
  const [userDetails, setUserDetails] = useState({
    email: "",
    paymentMethod: "JazzCash",
    USD: "",
    PKR: "0"
  });

  const returnGross = (inputVal) => {
    let fee = 4.4;
    if (inputVal > 3000 && inputVal <= 10000) {
      fee = 3.9; 
    } else if (inputVal > 10000 && inputVal <= 100000) {
      fee = 3.7;
    } else if (inputVal > 100000) {
      fee = 3.4;
    }

    var overallfee = (inputVal / 100) * fee;
    var grossDollars = inputVal - overallfee;

    //var totalPKR = parseInt(grossDollars * CURRENCY.USDPKR);
    var totalPKR = parseInt(grossDollars * USDPKR);
    

    var _tax = inputVal * CURRENCY.TAX;
    var grossPKR = totalPKR - _tax;

    if (inputVal === 0) {
      grossPKR = 0;
      grossDollars = 0;
    }

    
    var rVal = {
      _fee: fee,
      PKR: grossPKR,
      USD: grossDollars
    }
    return rVal;
  }

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: 'Friends and Family',
          amount: {
            currency_code: 'USD',
            value: over_amount
          },
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING'
      }
    }).then((orderID) => {
      setorderId(orderID);
      return orderID;
    })
  }

  const onApprove = (data, actions) => {
    return actions.order.capture().then(function (details) {
      const { payer } = details;
      setSuccess(true);
    })
  }

  const onError = (data, actions) => {
    setErrorMessage('An error occured with your payment');    
  }

  useEffect(() => {
    over_amount = initialValue;
  }, [initialValue])

  const updateAmount = (event) => {
    var _amount = parseInt(event.target.value);
    var _c = isNaN(_amount) ? 0 : _amount;
    
    var _gross = returnGross(_c);
    setinitialValue(_c);
    
    
    setInsideState("PKR", _gross.PKR);
    setInsideState("USD", _gross.USD);
  }

  const updateUserInfo = (event) => {
    const { value, name } = event.target;
    setInsideState(name, value);
  }

  const setInsideState = (_name, _value) => {
    setUserDetails((prev) => {
      return { ...prev, [_name]: _value }
    });
    console.info(userDetails);
  }

  return (
    <section id="exchange" className={`${styles.paddingY} ${styles.flexCenter} flex-col relative`}>
      <div className="absolute z-[0] w-[60%] h-[60%] -right-[50%] rounded-full blue__gradient" />
      <div className="w-full flex justify-between items-center md:flex-row flex-col sm:mb-16 mb-6 relative z-[1]">
        <span className={styles.heading2}>
          <h1 className={styles.heading2}>Dollar Exchange</h1>
          <p className={styles.paragraph}>Exchange USD with PKR</p>
          <p className={`${styles.paragraph} mt-2`}>Note: Please fill all the information accordingly to keep track of your order.</p>
          <p className={`${styles.paragraph} mt-2`}>Transaction Fee (PayPal): <b>4.4%</b>.</p>
        </span>
        <div className="w-full md:mt-0 mt-6">
          <p className={`${styles.paragraph} text-left max-w-[450px]`}>
            
            <label className='mt-2'>
              Amount you want to exchange: <span className='text-secondary'>{ userDetails.PKR } PKR</span>
              <input type="text"
                className={styles.inputField} 
                onChange={ (e) => updateAmount(e) }
                value={initialValue}
              />
            </label>
            
            <label className='mt-2'>
              Payment Processor:
              <select name='paymentMethod'
                className={styles.inputField}
                onChange={updateUserInfo}
                value={userDetails.paymentMethod}
              >
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">EasyPaisa</option>
              </select>
            </label>
            
            <label className='mt-2'>
              Account Detail: 
              <input type="text"
                className={styles.inputField} 
                name="email"
                onChange={updateUserInfo}
                placeholder='03xx-xxxxxxx'
              />
            </label>
            <PayPalScriptProvider
              options={{
                "client-id": "AQ8RUsectsEAW_XYmf6sYYQQLvhICEyOcw2Zcu-shc-vpu4ojWt8wus0iP3KdFr3XVVpafLh2Jf6Q0gt",
                "disable-funding": "credit"
              }}
            >

              <PayPalButtons style={{ layout: 'vertical' }}
               createOrder={createOrder}
               onApprove={onApprove}
               onError={onError} />
            </PayPalScriptProvider>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Exchange