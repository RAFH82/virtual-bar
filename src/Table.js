import React from 'react'
import { useHistory, useParams } from "react-router-dom";

import './Table.css'

function Table({ id, number }) { 

  const { barId } = useParams();
  const history = useHistory();

  const goToTable = () => {
		history.push(`/bar/${barId}/table/${id}`);
	};

  return (
    <div className="table" onClick={goToTable}>
        <img
					src="https://www.flaticon.com/svg/static/icons/svg/160/160705.svg"
					alt="table logo"
				/>
        <div className="title">{`Table #${number}!!`}</div>
    </div>
  )
}

export default Table
