import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import useUSElectionContract from "../hooks/useUSElectionContract";

type USContract = {
  contractAddress: string;
};

export enum Leader {
  UNKNOWN,
  BIDEN,
  TRUMP,
}

const USLibrary = ({ contractAddress }: USContract) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const usElectionContract = useUSElectionContract(contractAddress);
  const [currentLeader, setCurrentLeader] = useState<string>("Unknown");
  const [name, setName] = useState<string | undefined>();
  const [votesBiden, setVotesBiden] = useState<number | undefined>();
  const [votesTrump, setVotesTrump] = useState<number | undefined>();
  const [stateSeats, setStateSeats] = useState<number | undefined>();
  const [bidenSeats, setBidenSeats] = useState<number | undefined>();
  const [trumpSeats, setTrumpSeats] = useState<number | undefined>();
  const [electionStatus, setElectionStatus] = useState<boolean | undefined>();
  const [txStatus, setTxStatus] = useState<any | undefined>({
    hash: "",
    status: false,
  });

  useEffect(() => {
    getSeats();
    getElection();
    getCurrentLeader();
  }, []);

  const getSeats = async () => {
    const bidenSeats = await usElectionContract.seats(Leader.BIDEN);
    const trumpSeats = await usElectionContract.seats(Leader.TRUMP);
    setBidenSeats(bidenSeats);
    setTrumpSeats(trumpSeats);
  };

  const getElection = async () => {
    const electionStatus = await usElectionContract.electionEnded();
    setElectionStatus(electionStatus);
  };

  const getCurrentLeader = async () => {
    const currentLeader = await usElectionContract.currentLeader();
    setCurrentLeader(
      currentLeader == Leader.UNKNOWN
        ? "Unknown"
        : currentLeader == Leader.BIDEN
        ? "Biden"
        : "Trump"
    );
  };

  const stateInput = (input) => {
    setName(input.target.value);
  };

  const bideVotesInput = (input) => {
    setVotesBiden(input.target.value);
  };

  const trumpVotesInput = (input) => {
    setVotesTrump(input.target.value);
  };

  const seatsInput = (input) => {
    setStateSeats(input.target.value);
  };

  const submitStateResults = async () => {
    const result: any = [name, votesBiden, votesTrump, stateSeats];
    const tx = await usElectionContract.submitStateResult(result);
    setTxStatus({ hash: tx.hash, status: true });
    await tx.wait();
    setTxStatus({ hash: tx.hash, status: false });
    resetForm();
  };

  const endElection = async () => {
    const tx = await usElectionContract.endElection();
    setTxStatus({ hash: tx.hash, status: true });
    await tx.wait();
    setTxStatus({ hash: tx.hash, status: false });
  };

  const resetForm = async () => {
    setName("");
    setVotesBiden(0);
    setVotesTrump(0);
    setStateSeats(0);
  };

  return (
    <div className="results-form">
      <p>Current Leader is: {currentLeader}</p>
      <p>
        Trump seats {trumpSeats} won <br />
        Biden seats {bidenSeats} won
      </p>
      <p>{electionStatus ? "Election ENDED" : "Election on going"}</p>
      <form>
        <label>
          State:
          <input onChange={stateInput} value={name} type="text" name="state" />
        </label>
        <label>
          BIDEN Votes:
          <input
            onChange={bideVotesInput}
            value={votesBiden}
            type="number"
            name="biden_votes"
          />
        </label>
        <label>
          TRUMP Votes:
          <input
            onChange={trumpVotesInput}
            value={votesTrump}
            type="number"
            name="trump_votes"
          />
        </label>
        <label>
          Seats:
          <input
            onChange={seatsInput}
            value={stateSeats}
            type="number"
            name="seats"
          />
        </label>
        {/* <input type="submit" value="Submit" /> */}
      </form>
      <div className="button-wrapper">
        <button onClick={submitStateResults}>Submit Results</button>
      </div>
      <div className="button-wrapper">
        <button onClick={endElection}>End election</button>
      </div>
      <style jsx>{`
        .results-form {
          display: flex;
          flex-direction: column;
        }

        .button-wrapper {
          margin: 20px;
        }
      `}</style>
    </div>
  );
};

export default USLibrary;
