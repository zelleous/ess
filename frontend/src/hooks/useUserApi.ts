import api from "./api";

export default async function loginUser(data: { mobileNo: string; password: string }) {
	const res = await api.post("/user/login", data);

	return res.data;
}

export async function getUsers(id: string) {
	const res = await api.get("/user", { params: { id: id } });

	return res.data;
}

export async function activateUser({ id, token }: { id: string; token: string }) {
	const res = await api.post("/user/activate", null, {
		params: { id: id },
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return res.data;
}

export async function postResident({
	data,
	residentData,
	token,
}: {
	data: any;
	residentData: any;
	token: string;
}) {
	const res = await api.post(
		"/user/register/resident",
		{ data: data, residentData: residentData },
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	return res.data;
}
export async function postAdmin({ data, token }: { data: any; token: string }) {
	const res = await api.post("/user/register/admin", data, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return res.data;
}
