import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_KEY } from "../SecretKeys";
import { FormContainer, Table } from "./style.js";

const PayOut = () => {
  const [errorMsg, seterrorMsg] = useState("");
  const [countries, setCountries] = useState([]);
  const [editing, setEditing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [receiver, setReceiver] = useState({
    countryToSend: "",
    phoneNumber: "",
    valueInUSD: "",
  });
  const [receivers, setReceivers] = useState([]);
  // let validated = false;

  const getCountries = () => {
    let config = {
      method: "GET",
      url: "https://api.chimoney.io/v0.2/info/airtime-countries",
      headers: { "X-API-Key": API_KEY },
    };
    axios(config)
      .then(function (response) {
        setCountries(response.data.data);
        //   console.log(JSON.stringify(response.data.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    getCountries();
  }, []);

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
        setValidated(true);
          } else {
            seterrorMsg("make sure your phone number follows the correct format");
          }
    }
    return;
  };


  const updateReceiver = async() => {
      const receiversCopy = [...receivers];

      const index = receivers.findIndex(
        (item) => item.phoneNumber === receiver.phoneNumber
      );
      receiversCopy[index] = receiver; //an object

      setReceivers(receiversCopy);
      Swal.fire("Updated!", "Details updated successfully.", "success");
      setEditing(false);
      setReceiver({
        countryToSend: "",
        phoneNumber: "",
      });
  };


  const PayOutAirtime = () => {
    console.log(receivers)
   let config = {
    method: "POST",
    url: "https://api.chimoney.io/v0.2/payouts/airtime",
    // headers: {'X-API-Key': API_KEY},
    data: {
      airtimes: receivers
    }
  };
  if (receivers.length !== 0) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Pay Out Airtime!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data.phoneNumber.type));
            setReceivers({});
            Swal.fire("Sent!", "Airtime paid out successfully.", "success");
            setReceiver({
              countryToSend: receiver.countryToSend,
              phoneNumber: "",
              valueInUSD: receiver.valueInUSD,
            });
            validated = false;
            // setUpdated(false)
            console.log(receivers);
          })
          .catch(function (error) {
       
            seterrorMsg("An error occued during the transaction");
            console.log(error);
          });
      }
    })
  }else {
      seterrorMsg(
        "You have to input something first"
      );
    }
    }

  const handleSubmit = (e) => {
    e.preventDefault();

   validateFormInput();

    if(validated && !editing){
      setReceivers(receiver);
      console.log(receivers)
      PayOutAirtime();  
    }else if(validated && editing){
      setReceivers([...receivers, receiver]);
      console.log(receivers)
      updateReceiver();  
    }

  };


  const AddMore = (e) => {
    e.preventDefault();
      setReceivers([...receivers, receiver]);
      setReceiver({
        countryToSend: receiver.countryToSend,
        phoneNumber: "",
        valueInUSD: receiver.valueInUSD,
      });
      validated = false;
      console.log(receivers);
  };


  const handleEdit = (id) => {
    setEditing(true);
    const item = receivers.find((item) => item.phoneNumber === id);
    setReceiver(item);
  };

  const deleteReceiver = (id) => {
    setReceivers(receivers.filter((m) => m.phoneNumber !== id));
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
            {countries.length !== 0 ? (
              countries.map((country, index) => (
                <option key={index} value={country}>
                  {country}
                </option>
              ))
            ) : (
              <option value="">Loading..</option>
            )}
          </select>
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
      {receivers.length !== 0 ? (
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
            {receivers.map(
              ({ countryToSend, phoneNumber, valueInUSD }, index) => (
                <tr key={phoneNumber}>
                  <td>{index + 1}</td>
                  <td>{phoneNumber}</td>
                  <td>{countryToSend}</td>
                  <td>{valueInUSD}</td>
                  <td>
                    <button
                      className="edit"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteReceiver(phoneNumber)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
        
      ) : (
        ""
      )}
    </FormContainer>
  );
};

export default PayOut;
