import { ethers } from 'ethers';

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  handleApprove,
  loggedInUserAddress,
  handleCancel,
  isApproved,
  isCancelled
}) {
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter :</div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary :</div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value :</div>
          <div> {value ? ethers.utils.formatUnits(value,"ether") : 0} Ether  </div>
        </li>
        {(isApproved || isCancelled) ?  <li>
          <div> Status :</div>
          <div>{isApproved && "Approved"} {isCancelled && "Cancelled"}</div>
        </li> : null}
        { loggedInUserAddress === arbiter?.toLowerCase() && ((!isApproved || isCancelled) && (isApproved || !isCancelled)) ? <><div
          className="button"
          id={`${address}_approve`}
          onClick={(e) => {
            e.preventDefault();
            handleApprove();
          }}
        >
          Approve
        </div>
          <div className='button'
            id={`${address}_cancel`}
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}>Cancel</div></> 
          : null}
      </ul>
    </div>
  );
}
