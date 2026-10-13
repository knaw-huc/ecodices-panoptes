import {getRouteApi, Link} from '@tanstack/react-router'

interface Person {
    id: string
    name: string
    roles: string[]
    uris: string[]
}

export function PersonsPage() {
    const routeApi = getRouteApi("/persons")

    const {persons} = routeApi.useLoaderData()

    return <div>
        <h2>Persons Index</h2>
        <ul className="persons-list">
            {persons.map((item: Person) => {
                if (item.uris.length > 0) {
                    return <li className={"persons-list-item"} key={item.id}>
                        <Link search={{person: item.name}} to={"/search"}>
                            <h3>
                                {item.name} {item.roles.map(role => <span className={"role-label"}>{role}</span>)}
                            </h3>
                            <ul>
                                {item.uris.map(uri => <li key={uri}>{uri}</li>)}
                            </ul>
                        </Link>
                        {/*<hr />*/}
                    </li>
                } else {
                    return <li className={"persons-list-item"} key={item.id}>
                        <h3>
                            {item.name} {item.roles.map(role => <span className={"role-label"}>{role}</span>)}
                        </h3>
                        {/*<hr />*/}
                    </li>
                }
            })}
        </ul>
    </div>
}