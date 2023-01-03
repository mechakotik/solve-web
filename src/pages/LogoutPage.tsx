import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const LogoutPage = () => {
	const { status, updateStatus } = useContext(AuthContext);
	const [success, setSuccess] = useState<boolean>();
	useEffect(() => {
		if (!status) {
			return;
		}
		fetch("/api/v0/logout", {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=UTF-8",
			},
		})
			.then(() => {
				setSuccess(true);
				updateStatus();
			});
	}, [status, updateStatus]);
	if (!(status && status.user) || success) {
		return <Navigate to={"/"} />;
	}
	return <>Loading...</>;
};

export default LogoutPage;
