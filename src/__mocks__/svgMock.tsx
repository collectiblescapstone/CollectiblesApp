import * as React from 'react'

const SvgMock: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
    return <svg data-testid="logo" {...props} />
}

export default SvgMock
