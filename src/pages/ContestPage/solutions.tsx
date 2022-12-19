import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Contest, ContestProblem, ContestSolution, ContestSolutions, ErrorResponse, observeContestSolution, observeContestSolutions, TestReport } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Code from "../../ui/Code";
import DateTime from "../../ui/DateTime";
import UserLink from "../../ui/UserLink";
import Verdict from "../../ui/Verdict";

type ContestSolutionRowProps = {
    contest: Contest;
    solution: ContestSolution;
};

const ContestSolutionRow: FC<ContestSolutionRowProps> = props => {
    const { solution, contest } = props;
    const { id, create_time, compiler, participant, problem, report } = solution;
    const { statement } = problem as ContestProblem;
    let compilerName = compiler?.name;
    if (compiler?.config?.language) {
        compilerName = compiler.config.language;
        if (compiler.config.compiler) {
            compilerName += ` (${compiler.config.compiler})`;
        }
    }
    return <tr className="problem">
        <td className="id">
            <Link to={`/contests/${contest.id}/solutions/${id}`}>{id}</Link>
        </td>
        <td className="date">
            <DateTime value={create_time} />
        </td>
        <td className="participant">
            {participant && <>
                <span className="kind">{participant.kind}: </span>{participant.user ? <UserLink user={participant.user} /> : <>&mdash;</>}
            </>}
        </td>
        <td className="problem">
            {problem ? <Link to={`/contests/${contest.id}/problems/${problem.code}`}>{`${problem.code}. ${statement?.title ?? problem.title}`}</Link> : <>&mdash;</>}
        </td>
        <td className="compiler">
            {compilerName ?? <>&mdash;</>}
        </td>
        <td className="verdict">
            <Verdict report={report} />
        </td>
        <td className="points">
            {(report && report.points) || <>&mdash;</>}
        </td>
    </tr>;
};

type ContestSolutionsBlockProps = {
    contest: Contest;
};

const needUpdateSolution = (solution: ContestSolution) => {
    return solution.report?.verdict === "queued" || solution.report?.verdict === "running";
};

export const ContestSolutionsBlock: FC<ContestSolutionsBlockProps> = props => {
    const { contest } = props;
    const [error, setError] = useState<ErrorResponse>();
    const [solutions, setSolutions] = useState<ContestSolutions>();
    useEffect(() => {
        observeContestSolutions(contest.id)
            .then(result => setSolutions(result || []))
            .catch(setError);
    }, [contest.id]);
    useEffect(() => {
        if (!solutions) {
            return;
        }
        let needUpdate = false;
        solutions.solutions?.forEach(solution => {
            needUpdate = needUpdate || needUpdateSolution(solution);
        });
        if (!needUpdate) {
            return;
        }
        const updateSolutions = () => {
            observeContestSolutions(contest.id)
                .then(result => setSolutions(result || []))
                .catch(setError);
        };
        const interval = setInterval(updateSolutions, 2000);
        return () => clearInterval(interval);
    }, [contest.id, solutions]);
    if (!solutions) {
        return <Block title="Solutions" className="b-contest-solutions">
            {error ? <Alert>{error.message}</Alert> : "Loading..."}
        </Block>;
    }
    let contestSolutions: ContestSolution[] = solutions.solutions ?? [];
    return <Block title="Solutions" className="b-contest-solutions">{error ?
        <Alert>{error.message}</Alert> :
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="date">Date</th>
                    <th className="participant">Participant</th>
                    <th className="problem">Problem</th>
                    <th className="compiler">Compiler</th>
                    <th className="verdict">Verdict</th>
                    <th className="points">Points</th>
                </tr>
            </thead>
            <tbody>
                {contestSolutions.map((solution: ContestSolution, key: number) => {
                    return <ContestSolutionRow contest={contest} solution={solution} key={key} />;
                })}
            </tbody>
        </table>
    }</Block>;
};

type ContestSolutionBlockProps = {
    contest: Contest;
    solutionID: number;
};

export const ContestSolutionBlock: FC<ContestSolutionBlockProps> = props => {
    const { contest, solutionID } = props;
    const [error, setError] = useState<ErrorResponse>();
    const [solution, setSolution] = useState<ContestSolution>();
    useEffect(() => {
        observeContestSolution(contest.id, solutionID)
            .then(setSolution)
            .catch(setError);
    }, [contest.id, solutionID]);
    useEffect(() => {
        if (!solution || !needUpdateSolution(solution)) {
            return;
        }
        const updateSolution = () => {
            observeContestSolution(contest.id, solution.id)
                .then(setSolution)
                .catch(setError);
        };
        const interval = setInterval(updateSolution, 2000);
        return () => clearInterval(interval);
    }, [contest.id, solution]);
    if (!solution) {
        return <Block title="Solution" className="b-contest-solutions">
            {error ? <Alert>{error.message}</Alert> : "Loading..."}
        </Block>;
    }
    const { id, report, content, compiler } = solution;
    return <>
        <Block title={`Solution #${id}`} className="b-contest-solutions">
            {error && <Alert>{error.message}</Alert>}
            <table className="ui-table">
                <thead>
                    <tr>
                        <th className="id">#</th>
                        <th className="date">Date</th>
                        <th className="participant">Participant</th>
                        <th className="problem">Problem</th>
                        <th className="compiler">Compiler</th>
                        <th className="verdict">Verdict</th>
                        <th className="points">Points</th>
                    </tr>
                </thead>
                <tbody>
                    <ContestSolutionRow contest={contest} solution={solution} />
                </tbody>
            </table>
        </Block>
        {content && <Block title="Content" className="b-contest-solution-content">
            <Code content={content} language={compiler?.config?.extensions?.at(0)} />
        </Block>}
        {report && <Block title="Tests" className="b-contest-solution-tests">
            <table className="ui-table">
                <thead>
                    <tr>
                        <th className="id">#</th>
                        <th className="verdict">Verdict</th>
                        <th className="check-log">Check log</th>
                    </tr>
                </thead>
                <tbody>{report.tests?.map((test: TestReport, key: number) => {
                    return <tr className="problem">
                        <td className="id">{key + 1}</td>
                        <td className="verdict">
                            {test ? test.verdict : "running"}
                        </td>
                        <td className="check-log">
                            {(test && test.check_log) || <>&mdash;</>}
                        </td>
                    </tr>;
                })}</tbody>
            </table>
        </Block>}
    </>;
};
