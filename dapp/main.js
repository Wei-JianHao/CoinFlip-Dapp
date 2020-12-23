var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var from;

$(document).ready(function() {

    window.ethereum.enable().then(function(accounts){// Ask user for permission for webpage to access MetaMask.
      //contractInstance = new web3.eth.Contract(abi, address)
      // abi = template of the specification of the contract. What are the functions, what are the inputs and the outputs. javascript can than know what type of data to sent and to receive.
      from = accounts[0];
      contractInstance = new web3.eth.Contract(abi, "0x4039F08C27967c707083Add8ce6DE331De092e5E", {from: from});
      console.log(contractInstance);

      $("#bet_button").click(bet)
      $("#get_allBets").click(getAllBets)
    });

    function bet(){
      var choice = document.getElementById("choice").textContent;
      var choiceNB = headOrTail(choice);
      var betAmount = $("#betAmount").val();
      var config = {value: web3.utils.toWei(betAmount, "ether")}

      contractInstance.methods.makeBet(choiceNB).send(config)
      .on("transactionHash", function(hash){     //.on is an event listener listening to specific event
        console.log(hash);
      })
      .on("confirmation", function(confirmationNr){
        console.log(confirmationNr);
      })
      .on("receipt", function(receipt){
        console.log(receipt);
        // alert("Is mined");

        var queryID = receipt.events.logNewProvableQuery.returnValues.queryID;
        console.log(queryID);
        contractInstance.once("testBlocknumber", function(err, event){
          console.log(event);
        });
        contractInstance.once('betResult', {filter: {queryId: queryID}}, function(err, event){
          contractInstance.methods.getBetInfo(queryID).call().then(function(betResult){
              console.log("Success")
              insertRow(betResult);
            });
          });
      });
      // .then(function(){
      //   contractInstance.methods.getQueryIDs(from).call().then(function(queryIDs){
      //     var queryID = queryIDs[queryIDs.length-1];
      //
      //     // console.log(queryIDs);
      //     // console.log(queryID);
      //     contractInstance.methods.getBetInfo(queryID).call().then(function(betResult){
      //       insertRow(betResult);
      //     });
      //   });
      // });
      // .on('betResult', {filter: {queryId: queryID}}, function (err, events){
      //   console.log(events);
      // })
    };

    function getAllBets(){

      // Clear all table rows
      var new_tbody = document.createElement('tbody');
      new_tbody.setAttribute("id", "table_result_body");
      var old_tbody = document.getElementById('table_result_body');
      old_tbody.parentNode.replaceChild(new_tbody, old_tbody);

      contractInstance.methods.getQueryIDs(from).call().then(function(queryIDs){
        // console.log(queryIDs)
        insertRowLoop(0, queryIDs)
        });
      };

    function insertRowLoop(i, queryIDs){

      if (i < queryIDs.length) {
        var queryID = queryIDs[i];
        contractInstance.methods.getBetInfo(queryID).call().then(function(betResult){
          insertRow(betResult);
          i++;
          insertRowLoop(i, queryIDs);
        });
      };
    };

    function insertRow(betResult){
      var blockNumber = betResult.blockNumber;
      var choice = headOrTail(betResult.guessNumber);
      var amount = betResult.betAmount;
      var answer;
      var result;

      console.log(betResult.guessNumber);
      console.log(betResult.randomNumber);

      var bool = betResult.setRandomNumber;
      // console.log(betResult)
      // console.log(bool)
      // console.log(!bool)
      if (!bool){
        answer = "Pending";
        result = "Pending";
      }else {
        var textResult = "You lost ";

        if(betResult.guessNumber == betResult.randomNumber){
          textResult = "You won ";
          amount = String(parseInt(amount) * 2);
        }

        answer = headOrTail(betResult.randomNumber);
        result = textResult + web3.utils.fromWei(amount, "ether") + " ether";
      }

      // console.log(queryID);
      // console.log(blockNumber);
      insertTableRow(blockNumber, choice, answer, result);
    };

    function insertTableRow(inputC0, inputC1, inputC2, inputC3){
      var x = document.getElementById('table_result_body').insertRow(0);
      var c0 = x.insertCell(0);
      var c1 = x.insertCell(1);
      var c2 = x.insertCell(2);
      var c3 = x.insertCell(3);
      c0.innerHTML = inputC0;
      c1.innerHTML = inputC1;
      c2.innerHTML = inputC2;
      c3.innerHTML = inputC3;
    };

    function headOrTail(inputString){
      if (inputString == "0") {
        txt = "Head";
      }else if (inputString == "1"){
        txt = "Tail";
      }else if (inputString == "Head") {
        txt = "0";
      }else {
        txt = "1";
      };
      return txt;
    };
  });
