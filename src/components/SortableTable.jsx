import React from "react";
import { useTable, useSortBy, useBlockLayout } from "react-table";
import styled from "styled-components";
import { Row } from "react-bootstrap";

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

function Table({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [
          {
            id: "avg_prediction",
            desc: true,
          },
        ],
      },
      sortDescFirst: true,
    },
    useSortBy,
    useBlockLayout
  );

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // Add the sorting props to control sorting. For this example
                // we can add them into the header props
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  {/* Add a sort direction indicator */}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <br />
    </>
  );
}

export default (props) => {
  // TODO: consider using useMemo?
  const columns = [
    {
      Header: "Route",
      accessor: "route",
      Cell: ({ row }) => <a href={row.original.url}> {row.values.route} </a>,
    },
    {
      Header: "Average MP stars",
      accessor: "avg_stars",
      sortDescFirst: true,
      sortMethod: (a, b) => Number(a) - Number(b),
    },
    {
      Header: "Average prediction",
      accessor: "avg_prediction",
      sortDescFirst: true,
      sortMethod: (a, b) => Number(a) - Number(b),
    },
    {
      Header: "Nearest-neighbors prediction",
      accessor: "neighbor_prediction",
      sortDescFirst: true,
      sortMethod: (a, b) => Number(a) - Number(b),
    },
    {
      Header: "Slope-one prediction",
      accessor: "slope_one_prediction",
      sortDescFirst: true,
      sortMethod: (a, b) => Number(a) - Number(b),
    },
    { Header: "Grade", accessor: "grade" },
  ];
  const data = props.data; // useMemo?

  return (
    <Styles>
      <Table columns={columns} data={data} />;
    </Styles>
  );
};
