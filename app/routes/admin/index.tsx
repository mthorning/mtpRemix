import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { pool } from "~/utils";

interface Photo {
  title: string;
}

export async function loader() {
  const res = await pool.query("SELECT * FROM photos");
  return json(res.rows);
}

export default function Admin() {
  const photos: Photo[] = useLoaderData();
  return (
    <>
      <h1>Admin</h1>
      <table>
        <thead>
          <th>Title</th>
        </thead>
        <tbody>
          {photos.map((photo) => (
            <tr>
              <td>{photo.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
