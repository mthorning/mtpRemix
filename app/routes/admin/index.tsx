import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { pool, makeLinks } from "~/utils";
import tableStyle from "~/styles/table.css";

export const links = makeLinks(tableStyle);

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
    <div className="content">
      <h1>Admin</h1>
      {photos?.length ? (
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
      ) : (
        <p style={{ textAlign: "center" }}>No photos uploaded</p>
      )}
    </div>
  );
}
