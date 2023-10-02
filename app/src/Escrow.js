import { ethers } from 'ethers';

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  handleApprove,
  loggedInUserAddress
}) {
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value ? ethers.utils.formatUnits(value,"ether") : 0} Ether  </div>
        </li>
        { loggedInUserAddress === arbiter.toLowerCase() ? <><div
          className="button"
          id={address}
          onClick={(e) => {
            e.preventDefault();

            handleApprove();
          }}
        >
          Approve
        </div>
        <div className='button' onClick={(e)=>{e.preventDefault();console.log('cancel');}}>Cancel</div></> : null}
      </ul>
    </div>
  );
}
