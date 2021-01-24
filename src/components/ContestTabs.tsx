import React, {FC} from "react";
import {Link} from "react-router-dom";
import Block, {BlockProps} from "../ui/Block";
import "./ContestTabs.scss"

export type ContestTabsProps = BlockProps & {
	contestID: number;
	currentTab?: string;
};

const ContestTabs: FC<ContestTabsProps> = props => {
	const {contestID, currentTab} = props;
	const getActiveClass = (name: string): string => {
		return name === currentTab ? "active" : "";
	};
	return <Block className="b-contest-tabs">
		<ul className="ui-tabs">
			<li className={getActiveClass("problems")}>
				<Link to={`/contests/${contestID}`}>Problems</Link>
			</li>
			<li className={getActiveClass("solutions")}>
				<Link to={`/contests/${contestID}/solutions`}>Solutions</Link>
			</li>
		</ul>
	</Block>;
};

export default ContestTabs;
