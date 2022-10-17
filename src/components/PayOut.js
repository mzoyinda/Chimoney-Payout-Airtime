import axios from "axios";
import React, { useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import countries from "../countries";
import { API_KEY } from "../SecretKeys";

const PayOut = () => {
  const [errorMsg, seterrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [receiver, setReceiver] = useState({
    countryToSend: '',
    phoneNumber: '',
    valueInUSD:''
  });
  const [receivers, setReceivers] = useState([]);
  let validated = false

  const handleChange = (e) => {
    const { name, value } = e.currentTarget;

    if (name === "valueInUSD") {
      setReceiver({
        ...receiver,
        [name]: Number(value),
      });
    } else {
      setReceiver({
        ...receiver,
        [name]: value,
      });
    }
    console.log(receiver);
  };

  const validateFormInput = () => {
    if (
      !receiver.countryToSend ||
      !receiver.phoneNumber ||
      !receiver.valueInUSD
    ) {
      console.log("error");
      seterrorMsg("Please input all details");
    } else {
      //copy the first digit
      let Phone = receiver.phoneNumber;
      let firstDigit = Phone.slice(0, 1);

      //check if it is a valid phone number
      let CheckPhone = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g.test(
        Phone
      );

      //check if the first digit is "+" and it is a valid phone number
      if (firstDigit === "+" && CheckPhone) {
        //remove unneccessary symbols from phone number and
        // concatenate it with '+' to form a perfect phone number
        Phone = "+" + Phone.replace(/\D/g, "");
        validated = true
      } else {
        seterrorMsg("make sure your phone number follows the correct format");
      }
    }
  };

  const updateReceiver = () => {
    validateFormInput();
    if (validated) {
      const receiversCopy = [...receivers];
  
      const index = receivers.findIndex(
        (item) => item.phoneNumber === receiver.phoneNumber
      );
      receiversCopy[index] = receiver; //an object
  
      setReceivers(receiversCopy);
      Swal.fire(
        'Updated!',
        'Details updated successfully.',
        'success'
      );
      setEditing(false);
      setReceiver({
        countryToSend: '',
        phoneNumber: ''
      });
    } else return;
  };

  const PayOutAirtime = () => {

    console.log(receivers)
    let config = {
      method: "POST",
      url: "https://api.chimoney.io/v0.2/payouts/airtime",
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        "X-API-Key": API_KEY
      },
      data: {
        airtime: [receivers],
      },
    };
    if (receivers.length !== 0) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Pay Out Airtime!'
      })
        .then((result) => {
          if (result.isConfirmed) {
            axios(config)
              .then(function (response) {
                console.log(JSON.stringify(response.data));
                setReceivers({});
                Swal.fire(
                  'Sent!',
                  'Airtime paid out successfully.',
                  'success'
                );
              })
              .catch(function (error) {
                seterrorMsg(
                  "An error occured during the transaction"
                );
                console.log(error);
              });
          }
        })
    } else {
      seterrorMsg(
        "You have to input something first"
      );
    }
    
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editing ? updateReceiver() : PayOutAirtime();
  };

    const AddMore = async(e) => {
      e.preventDefault();
      
      await validateFormInput();
      if (validated) {
        setReceivers([...receivers, receiver]);
        setReceiver({
          countryToSend: '',
          phoneNumber: '',
          valueInUSD: receiver.valueInUSD
        });
        validated = false;
        console.log(receivers)
      } else return;

  };
    
  const handleEdit = (id) => {
    setEditing(true);
    const item = receivers.find((item) => item.phoneNumber === id);
    setReceiver(item);
  };

    const deleteReceiver = (id) => {
        setReceivers(receivers.filter((m) => m.phoneNumber !== id))
  };

  const clearErrorMsg = () => {
    seterrorMsg("");
  };

  return (
    <FormContainer>
      <h1>Payout Chimoney as Airtime</h1>
      <form onMouseDown={clearErrorMsg} onKeyDown={clearErrorMsg}>
        {errorMsg ? <p className="error">{errorMsg}</p> : ""}
        <div>
          <p>Country</p>
          <select
            name="countryToSend"
            value={receiver.countryToSend}
            id="country"
            onChange={handleChange}
          >
            <option value="">Select Your Country</option>
            {countries.map(({ name, value }) => (
              <option key={value} value={name}>
                {name}
              </option>
            ))}
          </select>
          {/* <input type="text" name="countryToSend" onChange={handleChange} id="country" placeholder='e.g: nigeria' /> */}
        </div>
        <div>
          <p>Phone number (+2349023..)</p>
          <input
            type="tel"
            name="phoneNumber"
            value={receiver.phoneNumber}
            onChange={handleChange}
            id="phone-number"
            placeholder="enter phone number"
          />
        </div>
        <div>
          <p>Amount in USD ($)</p>
          <input
            type="number"
            name="valueInUSD"
            value={receiver.valueInUSD}
            onChange={handleChange}
            id="valueInUSD"
            placeholder="eg: 10"
          />
        </div>

        <div className="button">
          {!editing ? <button onClick={AddMore}> Add More People </button> : ""}
          <button type="submit" onClick={handleSubmit}>
            {editing ? "Update" : "Payout Airtime"}
          </button>
        </div>
      </form>
      {receivers.length !== 0 ?
        <Table className="table">
          <thead>
            <tr>
              <th>id</th>
              <th>Phone number</th>
              <th>Country</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {receivers.map(({ countryToSend, phoneNumber, valueInUSD }, index) => (
              <tr key={phoneNumber}>
                <td>{index + 1}</td>
                <td>{phoneNumber}</td>
                <td>{countryToSend}</td>
                <td>{valueInUSD}</td>
                <td>
                  <button className="edit" onClick={() => handleEdit(phoneNumber)}>
                    Edit
                  </button>
                  <button className="delete" onClick={() => deleteReceiver(phoneNumber)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        : '' }
    </FormContainer>
  );
};

const FormContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  color: white;
  margin-bottom: 4rem;
  h1 {
    text-align: center;
    font-size: 2.5rem;
  }

  form {
    padding: 1rem;
    margin: 0 auto;
    width: 50vw;
    /* box-shadow: 0 5px 5px 0px #70dfd6e4; */
    p {
      font-size: 1.2rem;
      margin-bottom: 0.3rem;
    }
    .error {
      font-size: 1.5rem;
      color: #1a04048f;
      text-transform: capitalize;
      padding: 1rem;
      text-align: center;
      font-weight: 600;
    }
  }

  input,
  select {
    width: 50%;
    outline: none;
    font-size: 1.2rem;
    padding: 1rem;
    border: 1px solid #f8f8f8;
    background-color: #f8f8f8;
    margin-bottom: 2rem;
  }
  input {
    width: 90%;
  }
  .button {
    text-align: center;
    width: 90%;
    button {
      padding: 1rem 2rem;
      box-shadow: 0 5px 5px 0px #70dfd6e4;
      background: linear-gradient(
        135deg,
        rgba(142, 68, 173, 1) 0%,
        rgba(26, 188, 156, 1) 100%
      );
      border: none;
      text-transform: uppercase;
      color: white;
      font-size: 1rem;
      transition: all ease-in 0.5secs;
      font-weight: 600;
      :hover {
        cursor: pointer;
        font-size: 1.05rem;
      }
    }
    button+button{
      margin-left: 4rem;
    }
  }
`;

const Table = styled.table`
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  margin-top: 4rem;
  width: 50%;
  text-align: center;
  background-color: #F8F8F8;
  color: black;


td, th {
  border: 1px solid #ddd;
  padding: 8px;
}
td{
  font-size: 1rem;
}
tr{
  padding: 1rem;
}

 tr:nth-child(even){background-color: #f2f2f2;}

th {
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  background-color: #31A5A0;
  color: white;
}
.edit, .delete{
  padding: 0.5rem 2rem;
  background-color: #E8A84C;
  border: none;
}
.delete{
  background-color: #DE4251;
  
  color: #F8F8F8;
  margin-left: 1rem;
}
 `

export default PayOut;
