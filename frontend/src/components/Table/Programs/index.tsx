import { useMemo, useState } from "react";
import Link from "next/link";
import AuthStore from "../../../store/authStore";
import useProgramController from "./programController";
import getStatusColor from "../../../hooks/useStatusColor";
import ReactPaginate from "react-paginate";
const ProgramsTable = () => {
	const brgyId = AuthStore((state) => state.userData.brgyId);
	const role = AuthStore((state) => state.userData.role);
	const controller = useProgramController(brgyId);

	const { data, isSuccess, isLoading } = controller.getPrograms(brgyId);
	const [statusFilter, setStatusFilter] = useState("");
	const [viewFilter, setViewFilter] = useState("");
	const [sort, setSort] = useState("asc");

	const [searchFilter, setSearchFilter] = useState("");

	// filter function useMemo
	const handleFilteredData = useMemo(() => {
		if (isSuccess) {
			if (data.data !== "No Data") {
				const sorted = data.data.sort((a: any, b: any) => {
					return sort === "asc" ? a.name.localeCompare(b.name) : -a.name.localeCompare(b.name);
				});

				const roleFilter = sorted.filter((d: any) => {
					return role === "Brgy. Admin" ? role === d.view : d;
				});

				const statusSort = roleFilter.filter((d: any) => {
					return d.status.includes(statusFilter);
				});

				const viewSort = statusSort?.filter((d: any) =>
					viewFilter ? d.view.toLowerCase() === viewFilter.toLowerCase() : d
				);

				const nameSort = viewSort.filter((d: any) =>
					d.name.toLowerCase().includes(searchFilter.toLowerCase())
				);

				const typeSort = viewSort.filter((d: any) =>
					d.type.toString().toLowerCase().includes(searchFilter.toString().toLowerCase())
				);

				const qualificationSort = viewSort.filter((d: any) =>
					d.qualification.toString().toLowerCase().includes(searchFilter.toString().toLowerCase())
				);
				let brgyIdSort = [];
				if (role === "Master Admin") {
					brgyIdSort = statusSort?.filter((d: any) =>
						d.brgyId.toString().includes(searchFilter.toString())
					);
				}

				return searchFilter === ""
					? viewSort
					: [...new Set([...nameSort, ...typeSort, ...qualificationSort, ...brgyIdSort])].length > 0
					? [...new Set([...nameSort, ...typeSort, ...qualificationSort, ...brgyIdSort])]
					: "No Results Found";
			}
			return "No Data";
		}
	}, [isSuccess, data, searchFilter, statusFilter, viewFilter, sort]);
	//PAGINATION
	const [itemOffset, setItemOffset] = useState(0);
	const itemsPerPage = 10;
	const endOffset = itemOffset + itemsPerPage;
	console.log(`Loading items from ${itemOffset} to ${endOffset}`);
	console.log("check 1", handleFilteredData);
	let currentItems: any[] = [];
	let pageCount = 0;
	if (isSuccess === true && handleFilteredData !== "No data") {
		currentItems = handleFilteredData.slice(itemOffset, endOffset);
		pageCount = Math.ceil(handleFilteredData.length / itemsPerPage);
	}
	// Changing page
	//@ts-ignore
	const handlePageClick = (event) => {
		const newOffset = (event.selected * itemsPerPage) % handleFilteredData.length;
		console.log(`User requested page number ${event.selected}, which is offset ${newOffset}`);
		setItemOffset(newOffset);
	};
	return (
		<>
			<div className="flex gap-3">
				<input
					placeholder={`Search Name, ${
						role === "Master Admin" ? "Barangay ID," : ""
					} Type or Qualifications.`}
					type="text"
					onChange={(e) => {
						setSearchFilter(e.target.value);
					}}
					value={searchFilter}
					className="input input-bordered w-full mt-3"
				/>
				{role !== "Brgy. Admin" && (
					<>
						<label className="flex items-center"> View </label>
						<select
							placeholder="View"
							onChange={(e) => {
								setViewFilter(e.target.value);
							}}
							value={viewFilter}
							className="input input-bordered mt-3"
						>
							<option value="--Please select one--" selected hidden>
								--Please select one--
							</option>
							<option value="Brgy. Admin">Brgy. Admin</option>
							<option value="Admin">Admin</option>
							<option value="Master Admin">Master Admin</option>
						</select>
					</>
				)}
				<label className="flex items-center"> Status </label>
				<select
					placeholder="Status"
					onChange={(e) => {
						setStatusFilter(e.target.value);
					}}
					value={statusFilter}
					className="input input-bordered mt-3"
				>
					<option value="--Please select one--" selected hidden>
						--Please select one--
					</option>
					<option value="Pending">Pending</option>
					<option value="Completed">Completed</option>
					<option value="Cancelled">Cancelled</option>
				</select>
			</div>
			<div className="w-full mt-4 mb-4 p-1 bg-base-200" />
			<div className="w-full mt-4 overflow-x-auto m-auto">
				<table className="table w-full m-auto">
					<thead>
						<tr>
							<th className="sticky top-0 px-6 py-3 flex justify-between items-center">
								NAME
								<label className="swap swap-rotate">
									<input type="checkbox" onClick={() => setSort(sort === "asc" ? "desc" : "asc")} />

									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
										className="w-6 h-6 swap-off"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M4.5 15.75l7.5-7.5 7.5 7.5"
										/>
									</svg>

									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
										className="w-6 h-6 swap-on"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M19.5 8.25l-7.5 7.5-7.5-7.5"
										/>
									</svg>
								</label>
							</th>
							<th className="sticky top-0 px-6 py-3">BRGY. ID</th>
							<th className="sticky top-0 px-6 py-3">TYPE</th>
							<th className="sticky top-0 px-6 py-3">QUALIFICATIONS</th>
							<th className="sticky top-0 px-6 py-3 w-[5rem]">VIEW</th>
							<th className="sticky top-0 px-6 py-3 w-[8rem]">STATUS</th>
							<th className="sticky top-0 px-6 py-3 w-6"></th>
							{role === "Master Admin" && <th className="sticky top-0 px-6 py-3 w-6"></th>}
						</tr>
					</thead>
					<tbody>
						{isLoading && (
							<tr>
								<td>Loading...</td>
								<td></td>
								<td className="text-center"></td>
							</tr>
						)}
						{isSuccess &&
						handleFilteredData !== "No Data" &&
						handleFilteredData !== "No Results Found" ? (
							currentItems.map((program: any) => (
								<tr key={program.id}>
									<td className="">{program.name}</td>
									<td className="">{program.brgyId}</td>
									<td className="w-[15rem] truncate">{program.type}</td>
									<td className="">{program.qualification}</td>
									<td className="">{program.view}</td>
									<td className="text-center text-white text-sm">
										<div className={`card p-0 px-1 py-1 ${getStatusColor(`${program.status}`)}`}>
											{program.status}
										</div>
									</td>
									{role === "Master Admin" && (
										<td>
											<Link href={`/dashboard/programs/edit/${program.id}`}>
												<a className="btn btn-ghost">Edit</a>
											</Link>
										</td>
									)}
									{role === "Master Admin" && (
										<td>
											<input type="checkbox" id={program.id} className="modal-toggle" />
											<div className="modal" id={program.id}>
												<div className="modal-box">
													<p className="py-4">Are you sure that you want to delete this record?</p>
													<div className="modal-action">
														<label
															htmlFor={program.id}
															className="btn-secondary mt-10 rounded-lg py-2 px-3 w-max"
														>
															Back
														</label>
														<button
															className="btn-primary mt-10 rounded-lg py-2 px-3 w-max"
															type="submit"
															onClick={() => controller.deleteProgram(program.id)}
														>
															Confirm
														</button>
													</div>
												</div>
											</div>

											<label htmlFor={program.id} className="btn btn-ghost">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth={1.5}
													stroke="currentColor"
													className="w-6 h-6"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
													/>
												</svg>
											</label>
										</td>
									)}
								</tr>
							))
						) : handleFilteredData === "No Results Found" ? (
							<tr>
								<td className="">No Results Found</td>
								<td className="w-[15rem] truncate"></td>
								<td className="w-[15rem] truncate"></td>

								<td className="w-[15rem] truncate"></td>
								<td className="text-center"></td>
								<td className="w-[15rem] truncate"></td>

								<td></td>
							</tr>
						) : (
							<tr>
								<td className="">No Data</td>
								<td className="w-[15rem] truncate"></td>
								<td className="w-[15rem] truncate"></td>

								<td className="w-[15rem] truncate"></td>
								<td className="text-center"></td>
								<td className="w-[15rem] truncate"></td>

								<td></td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<div className="flex flex-row justify-center pt-2">
				<ReactPaginate
					className="rounded-none"
					breakLabel="..."
					breakClassName="btn btn-md p-0 rounded-none border-none"
					breakLinkClassName="btn btn-md bg-primary border-none rounded-none"
					nextLabel="next >"
					nextClassName="btn btn-md p-0 rounded-none border-none"
					nextLinkClassName="btn btn-md bg-primary border-none rounded-none"
					onPageChange={handlePageClick}
					pageRangeDisplayed={5}
					pageCount={pageCount}
					pageClassName="btn btn-md p-0 bg-primary rounded-none border-none"
					pageLinkClassName="btn btn-md bg-transparent border-none rounded-none"
					previousLabel="< previous"
					previousClassName="btn btn-md p-0 rounded-none border-none"
					previousLinkClassName="btn btn-md bg-primary border-none rounded-none"
					containerClassName="btn-group px-5 "
					activeClassName="btn btn-md bg-secondary"
				/>
			</div>
		</>
	);
};

export default ProgramsTable;
